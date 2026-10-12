// Builds the static site into dist/: one plain-HTML page per preset, plus the shared assets,
// sitemap and hosting files. No dependencies: `node build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://crm.unysonplus.com';
const TODAY = new Date().toISOString().slice(0, 10);

/* Industries shown in the picker and the industry select. A preset file makes one live. */
const INDUSTRIES = [
  { id: 'real-estate', label: 'Real estate', desc: 'Listings, showings, valuations and IDX' },
  { id: 'home-services', label: 'Home services', desc: 'Quotes and jobs for plumbing, roofing and HVAC' },
  { id: 'clinic', label: 'Dental or medical clinic', desc: 'Appointment requests and recalls' },
  { id: 'law-firm', label: 'Law firm', desc: 'Consultations and new matters' },
  { id: 'fitness', label: 'Fitness studio or gym', desc: 'Trial classes and memberships' },
  { id: 'salon', label: 'Salon and spa', desc: 'Bookings and regular clients' },
  { id: 'recruitment', label: 'Recruitment agency', desc: 'Candidates, roles and placements' },
  { id: 'venue', label: 'Event venue and weddings', desc: 'Date enquiries, tours and bookings' }
];

/* Questions every industry page answers. Presets opt in with page.faqCommon. */
const COMMON_FAQ = [
  { q: 'Is it really free?', a: 'Yes. The generator, the Unyson+ plugin and theme, and the AI Dev Kit are free. You only pay for your own hosting and, if you use one, your AI agent subscription.' },
  { q: 'Do I need to know how to code?', a: 'No. You fill in a form and copy the result. Your AI agent does the building. After it is built, the site is edited in the WordPress admin with a visual page builder.' },
  { q: 'Which AI agents can use the prompt?', a: 'Any agent that can read files and run commands on the machine or server hosting WordPress, such as Claude Code, Cursor or Codex. Chat-only assistants can follow the plan, but you will have to carry out the steps yourself.' }
];
const faqOf = (P) => P.page.faq.concat(P.page.faqCommon ? COMMON_FAQ : []);

/* ---------- load presets (they call CRMGEN.register) ---------- */

// The engine runs here too (with a stub DOM), so presets can use its helpers.
const ctx = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SRC, 'assets', 'engine.js'), 'utf8'), ctx, { filename: 'engine.js' });
ctx.CRMGEN = ctx.window.CRMGEN;
const presets = ctx.CRMGEN.presets;
for (const f of fs.readdirSync(path.join(SRC, 'presets')).filter((f) => f.endsWith('.js'))) {
  vm.runInContext(fs.readFileSync(path.join(SRC, 'presets', f), 'utf8'), ctx, { filename: f });
}
const HOME = presets['any-business'];
if (!HOME) throw new Error('any-business preset is required');
const PATHS = Object.fromEntries(Object.values(presets).map((p) => [p.id, p.path]));

/* ---------- helpers ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function copyDir(a, b) {
  fs.mkdirSync(b, { recursive: true });
  for (const e of fs.readdirSync(a, { withFileTypes: true })) {
    const s = path.join(a, e.name), d = path.join(b, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
const hash = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
const HERO_ART = fs.readFileSync(path.join(SRC, 'partials', 'hero-art.html'), 'utf8');

/* ---------- page parts ---------- */

function jsonLd(P) {
  const url = SITE + P.path;
  const graph = [
    {
      '@type': 'WebApplication',
      '@id': url + '#app',
      name: P.page.schemaName,
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (runs in the browser)',
      description: P.page.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
      publisher: { '@id': SITE + '/#org' }
    },
    { '@type': 'Organization', '@id': SITE + '/#org', name: 'Unyson+', url: 'https://docs.unysonplus.com/', sameAs: ['https://github.com/UnysonPlus'] },
    {
      '@type': 'HowTo',
      name: 'How to build a free ' + (P.id === 'any-business' ? '' : P.label.toLowerCase() + ' ') + 'CRM website on WordPress',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose your features', text: 'Choose pages, ' + P.content.legend.toLowerCase() + ', lead forms, pipeline stages and brand colors.' },
        { '@type': 'HowToStep', position: 2, name: 'Copy the prompt and spec', text: 'Copy the build prompt, which ends with the full site spec.' },
        { '@type': 'HowToStep', position: 3, name: 'Let your AI agent build it', text: 'Give the prompt to your AI coding agent together with the free Unyson+ AI Dev Kit. It enables WordPress features and builds the site.' }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqOf(P).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: strip(f.a) } }))
    }
  ];
  if (P.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'CRM Website Generator', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: P.label, item: url }
      ]
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function head(P, v) {
  const url = SITE + P.path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(P.page.title)}</title>
<meta name="description" content="${esc(P.page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#183737">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Unyson+">
<meta property="og:title" content="${esc(P.page.h1)}">
<meta property="og:description" content="${esc(P.page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(P.page.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(P.page.h1)}">
<meta name="twitter:description" content="${esc(P.page.description)}">
<meta name="twitter:image" content="${SITE}/assets/og-image.png">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" as="image" href="/assets/img/hero-bg.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..800&display=swap">
<link rel="stylesheet" href="/assets/style.css?v=${v.css}">
<script type="application/ld+json">
${jsonLd(P)}
</script>
</head>`;
}

function topbar() {
  return `<header class="top">
  <div class="wrap top__in">
    <a class="logo" href="/" aria-label="Unyson+ CRM Generator home">
      <img src="/assets/img/unysonplus-logo.png" width="174" height="40" alt="Unyson+ Framework">
      <span class="logo__app">CRM Generator</span>
    </a>
    <nav aria-label="Main">
      <a href="#how">How it works</a>
      <a href="/#industries">Industries</a>
      <a href="#faq">FAQ</a>
      <a href="https://docs.unysonplus.com/guides/crm-generator">Docs</a>
    </nav>
  </div>
</header>`;
}

function hero(P) {
  const crumbs = P.path === '/' ? '' : `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">CRM Website Generator</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(P.label)}</span></nav>\n        `;
  return `<section class="hero">
    <div class="wrap hero__in">
      <div class="hero__copy">
        ${crumbs}<p class="hero__tag">Free · No sign-up · Runs in your browser</p>
        <h1>${esc(P.page.h1)}</h1>
        <p class="hero__lede">${esc(P.page.lede)}</p>
        <div class="hero__cta">
          <a class="btn btn--accent" href="#generator">Build my CRM site</a>
          <a class="btn btn--ghost" href="#how">See how it works</a>
        </div>
        <p class="hero__note">${esc(P.page.note)}</p>
      </div>
      ${HERO_ART.trim()}
    </div>
  </section>`;
}

function picker() {
  const items = INDUSTRIES.map((i) => {
    const live = presets[i.id];
    return live
      ? `<li class="ind ind--live"><a href="${live.path}"><b>${esc(i.label)}</b><span>${esc(i.desc)}</span><em>Open the generator</em></a></li>`
      : `<li class="ind"><div><b>${esc(i.label)}</b><span>${esc(i.desc)}</span><em>Coming soon</em></div></li>`;
  }).join('\n        ');
  return `<section id="industries" class="pick" aria-labelledby="pickTitle">
    <div class="wrap">
      <div class="pick__head">
        <h2 id="pickTitle">Start from your industry</h2>
        <p>Each industry preset sets the right pages, lead forms, pipeline stages and rules. Not listed? The generator below works for any business.</p>
      </div>
      <ul class="pick__list">
        ${items}
      </ul>
      <p class="pick__more">See what is coming next on the <a href="https://docs.unysonplus.com/guides/crm-generator-roadmap">roadmap</a>.</p>
    </div>
  </section>`;
}

function chip(name, o) {
  return `<label><input type="checkbox" name="${name}" value="${esc(o.value)}"${o.checked ? ' checked' : ''}><span>${esc(o.label)}</span></label>`;
}
function check(name, item, sub) {
  return `<label class="check"><input type="checkbox" name="${name}" value="${esc(item.id)}"${item.required ? ' checked disabled' : ''}><span><b>${esc(item.title)}${item.required ? ' (always included)' : ''}</b><small>${esc(sub)}</small></span></label>`;
}
function input(name, label, opts = {}) {
  const hint = opts.hint ? ` <i>${esc(opts.hint)}</i>` : '';
  const ph = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const ctl = opts.textarea
    ? `<textarea name="${name}" rows="3"${ph}></textarea>`
    : `<input name="${name}"${opts.type ? ` type="${opts.type}"` : ''}${opts.auto ? ` autocomplete="${opts.auto}"` : ''}${ph}${opts.value ? ` value="${esc(opts.value)}"` : ''}>`;
  return `<label class="field"><span>${esc(label)}${hint}</span>${ctl}</label>`;
}
function select(name, label, options) {
  return `<label class="field"><span>${esc(label)}</span><select name="${name}">${options.map((o) => `<option value="${esc(o.value)}"${o.selected ? ' selected' : ''}${o.disabled ? ' disabled' : ''}${o.path ? ` data-path="${o.path}"` : ''}>${esc(o.label)}</option>`).join('')}</select></label>`;
}

function formHtml(P) {
  const B = P.business;
  const C = P.content;
  const industryOpts = [{ value: 'any-business', label: 'Any business', path: '/', selected: P.id === 'any-business' }]
    .concat(INDUSTRIES.map((i) => presets[i.id]
      ? { value: i.id, label: i.label, path: presets[i.id].path, selected: P.id === i.id }
      : { value: '', label: i.label + ' (coming soon)', disabled: true }));
  const extraFields = B.fields || [];
  const longFields = extraFields.filter((f) => f.textarea);
  const shortFields = extraFields.filter((f) => !f.textarea);

  const contentFs = C ? `
          <fieldset>
            <legend>${esc(C.legend)}</legend>
            ${C.sources ? `<div class="seg" role="radiogroup" aria-label="${esc(C.sourcesLabel)}">
              ${C.sources.map((s) => `<label><input type="radio" name="source" value="${esc(s.value)}"${s.checked ? ' checked' : ''}><span><b>${esc(s.title)}</b><small>${esc(s.desc)}</small></span></label>`).join('\n              ')}
            </div>` : ''}
            ${C.provider ? `<label class="field" id="providerField" hidden>
              <span>${esc(C.provider.label)}</span>
              <select name="provider"><option value="">${esc(C.provider.placeholder)}</option>${C.provider.options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>
              <small class="hint">${esc(C.provider.hint)}</small>
            </label>` : ''}
            <p class="sub">${esc(C.includedText)}</p>
            <p class="sublabel">${esc(C.extrasLabel)}</p>
            <div class="chips">
              ${C.extras.map((x) => chip('extras', x)).join('\n              ')}
            </div>
            <label class="field field--inline">
              <span>${esc(C.samples.label)}</span>
              <select name="samples">${C.samples.options.map((n) => `<option value="${n}"${n === C.samples.selected ? ' selected' : ''}>${n === 0 ? 'None' : n}</option>`).join('')}</select>
            </label>
          </fieldset>` : '';

  return `<form id="form" class="form" novalidate>
          <fieldset>
            <legend>Business</legend>
            <div class="row">
              ${select('vertical', 'Industry', industryOpts)}
              ${select('businessType', 'Business type', B.types.map((t) => ({ value: t.value, label: t.label, selected: t.selected })))}
            </div>
            <div class="row">
              ${input('name', 'Business name', { placeholder: B.namePlaceholder, auto: 'organization' })}
              ${input('market', B.marketLabel, { placeholder: B.marketPlaceholder })}
            </div>
            ${longFields.map((f) => input(f.name, f.label, { textarea: true, placeholder: f.placeholder })).join('\n            ')}
            ${input('tagline', 'Tagline', { hint: 'optional', placeholder: B.taglinePlaceholder })}
            ${shortFields.length ? `<div class="row">
              ${shortFields.map((f) => input(f.name, f.label, { hint: f.hint, placeholder: f.placeholder })).join('\n              ')}
            </div>` : ''}
          </fieldset>

          <fieldset>
            <legend>${esc(P.audience.legend)}</legend>
            <div class="chips">
              ${P.audience.options.map((o) => chip('audience', o)).join('\n              ')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Pages</legend>
            <div class="checks">
              ${P.pages.map((p) => check('pages', p, p.purpose)).join('\n              ')}
            </div>
          </fieldset>
${contentFs}
          <fieldset>
            <legend>Lead capture</legend>
            <div class="checks">
              ${P.forms.map((f) => check('forms', f, 'Placed on: ' + f.where)).join('\n              ')}
            </div>
            ${input('leadEmail', 'Send new leads to', { type: 'email', auto: 'email', placeholder: 'leads@yourdomain.com' })}
          </fieldset>

          <fieldset>
            <legend>CRM pipeline</legend>
            <label class="field"><span>Stages <i>one per line, in order</i></span><textarea name="stages" rows="${P.stages.length + 1}"></textarea></label>
            <p class="sublabel">Follow-up emails</p>
            <div class="chips">
              ${P.emails.map((e) => chip('emails', e)).join('\n              ')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Brand</legend>
            <div class="row row--3">
              <label class="field field--color"><span>Primary color</span><input type="color" name="primary" value="#1f4a40"></label>
              <label class="field field--color"><span>Accent color</span><input type="color" name="accent" value="#e07b39"></label>
              ${select('style', 'Style', [{ value: 'modern', label: 'Modern', selected: true }, { value: 'classic', label: 'Classic' }, { value: 'luxury', label: 'Luxury' }, { value: 'friendly', label: 'Warm, friendly' }])}
            </div>
            <div class="row">
              ${select('logo', 'Logo', [{ value: 'have', label: 'I have a logo file' }, { value: 'text', label: 'Business name as text', selected: true }])}
              ${input('language', 'Site language', { value: 'English' })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Build setup</legend>
            <div class="row">
              ${select('agent', 'AI agent', [{ value: 'claude-code', label: 'Claude Code', selected: true }, { value: 'cursor', label: 'Cursor' }, { value: 'codex', label: 'Codex' }, { value: 'other', label: 'Another coding agent' }])}
              ${select('wp', 'WordPress', [{ value: 'local', label: 'On my computer (local)', selected: true }, { value: 'host', label: 'On my web host' }, { value: 'none', label: 'Not installed yet' }])}
            </div>
          </fieldset>

          <section class="ready" aria-labelledby="readyTitle">
            <h3 id="readyTitle">Before you build</h3>
            <p>Anything missing goes into the prompt, so your agent asks you for it first.</p>
            <ul id="checklist" class="ready__list" aria-live="polite"></ul>
          </section>

          <button type="button" class="btn btn--quiet" id="reset">Reset to defaults</button>
        </form>`;
}

function generator(P) {
  return `<section id="generator" class="gen" aria-labelledby="genTitle" data-preset="${P.id}">
    <div class="wrap">
      <div class="gen__head">
        <h2 id="genTitle">${esc(P.page.genTitle)}</h2>
        <p>Every choice updates the prompt on the right. Your answers are saved in this browser only; nothing is sent anywhere.</p>
      </div>
      <div class="gen__grid">
        ${formHtml(P)}

        <aside class="out" aria-label="Generated output">
          <div class="out__bar">
            <div class="tabs" role="tablist">
              <button role="tab" id="tab-prompt" data-tab="prompt" aria-controls="panel-prompt" aria-selected="true">Prompt</button>
              <button role="tab" id="tab-preview" data-tab="preview" aria-controls="panel-preview" aria-selected="false" tabindex="-1">Preview</button>
              <button role="tab" id="tab-spec" data-tab="spec" aria-controls="panel-spec" aria-selected="false" tabindex="-1">site-spec.json</button>
            </div>
            <span class="out__meta" id="meta" aria-live="polite"></span>
          </div>
          <div class="out__panel" id="panel-prompt" role="tabpanel" aria-labelledby="tab-prompt" tabindex="0"><pre id="promptOut"></pre></div>
          <div class="out__panel out__panel--light" id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" tabindex="0" hidden><div id="previewOut"></div></div>
          <div class="out__panel" id="panel-spec" role="tabpanel" aria-labelledby="tab-spec" tabindex="0" hidden><pre id="specOut"></pre></div>
          <div class="out__actions">
            <button type="button" class="btn btn--accent" id="copy">Copy prompt</button>
            <button type="button" class="btn btn--ghost-dark" id="download">Download prompt</button>
            <button type="button" class="btn btn--ghost-dark" id="share">Copy share link</button>
          </div>
          <p class="out__status" id="status" role="status" aria-live="polite"></p>
        </aside>
      </div>
    </div>
  </section>`;
}

function how(P) {
  return `<section id="how" class="how" aria-labelledby="howTitle">
    <div class="wrap">
      <h2 id="howTitle">How it works</h2>
      <ol class="steps">
        <li>
          <h3>Choose your features</h3>
          <p>Start from ${P.id === 'any-business' ? 'a description of your business' : 'the ' + esc(P.label.toLowerCase()) + ' preset'} and switch on the pages, ${esc(P.content.legend.toLowerCase())}, lead forms and pipeline stages you need. Pick your colors and style.</p>
        </li>
        <li>
          <h3>Copy the prompt and spec</h3>
          <p>The prompt tells your agent what to build and in what order. <code>site-spec.json</code> holds every choice in a structured file, so the result does not depend on how the agent reads a paragraph.</p>
        </li>
        <li>
          <h3>Your AI agent builds the site</h3>
          <p>Paste the prompt into Claude Code, Cursor, Codex or another coding agent. It reads the free Unyson+ AI Dev Kit, enables the right features and builds the pages, forms and CRM on your WordPress install.</p>
        </li>
      </ol>
    </div>
  </section>`;
}

function included(P) {
  return `<section id="included" class="inc" aria-labelledby="incTitle">
    <div class="wrap inc__grid">
      <div class="inc__intro">
        <h2 id="incTitle">What your ${P.id === 'any-business' ? '' : esc(P.label.toLowerCase()) + ' '}CRM website includes</h2>
        <p>Everything runs on free Unyson+ features inside WordPress. There are no extra CRM subscriptions, and your leads stay in your own database.</p>
      </div>
      <dl class="inc__list">
        ${P.page.included.map((i) => `<div><dt>${esc(i.t)}</dt><dd>${esc(i.d)}</dd></div>`).join('\n        ')}
      </dl>
    </div>
  </section>`;
}

function callout(P) {
  if (!P.page.callout) return '';
  return `<section class="idx" aria-labelledby="calloutTitle">
    <div class="wrap idx__in">
      <h2 id="calloutTitle">${esc(P.page.callout.title)}</h2>
      <p>${P.page.callout.html}</p>
    </div>
  </section>`;
}

function faq(P) {
  return `<section id="faq" class="faq" aria-labelledby="faqTitle">
    <div class="wrap faq__in">
      <h2 id="faqTitle">Questions</h2>
      ${faqOf(P).map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join('\n      ')}
    </div>
  </section>`;
}

function closing() {
  return `<section class="cta" aria-labelledby="ctaTitle">
    <div class="wrap cta__in">
      <h2 id="ctaTitle">Your CRM website is a form away</h2>
      <p>Pick your features, copy the prompt, and let your AI agent build it on WordPress. Free, with no account to create.</p>
      <a class="btn btn--accent" href="#generator">Build my CRM site</a>
    </div>
  </section>`;
}

function footer() {
  return `<footer class="foot">
  <div class="wrap foot__in">
    <p>Made by <a href="https://docs.unysonplus.com/">Unyson+</a>, the free WordPress page builder framework.</p>
    <nav aria-label="Footer">
      <a href="https://docs.unysonplus.com/guides/crm-generator">Generator guide</a>
      <a href="https://docs.unysonplus.com/guides/crm-generator-roadmap">Roadmap</a>
      <a href="https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit">AI Dev Kit</a>
      <a href="https://github.com/UnysonPlus/UnysonPlus">Plugin on GitHub</a>
    </nav>
  </div>
</footer>`;
}

function page(P, v) {
  return `${head(P, v)}
<body>
<a class="skip" href="#generator">Skip to the generator</a>
${topbar()}
<main>
  ${hero(P)}
  ${P.path === '/' ? picker() : ''}
  ${generator(P)}
  ${how(P)}
  ${included(P)}
  ${callout(P)}
  ${faq(P)}
  ${closing()}
</main>
${footer()}
<script>window.CRMGEN_PATHS = ${JSON.stringify(PATHS)};</script>
<script src="/assets/engine.js?v=${v.engine}" defer></script>
<script src="/assets/presets/${P.id}.js?v=${v[P.id]}" defer></script>
</body>
</html>
`;
}

/* ---------- build ---------- */

// Empty dist/ rather than deleting it, so a local server running inside it keeps working.
fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT)) rmrf(path.join(OUT, e));
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
copyDir(path.join(SRC, 'presets'), path.join(OUT, 'assets', 'presets'));
copyDir(path.join(SRC, 'static'), OUT);

const v = { css: hash(path.join(SRC, 'assets', 'style.css')), engine: hash(path.join(SRC, 'assets', 'engine.js')) };
for (const id of Object.keys(presets)) v[id] = hash(path.join(SRC, 'presets', id + '.js'));

const urls = [];
for (const P of Object.values(presets)) {
  const dir = path.join(OUT, P.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(P, v));
  urls.push(P.path);
  console.log('built', P.path);
}

urls.sort((a, b) => a.length - b.length);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.9'}</priority>
  </url>`).join('\n')}
</urlset>
`);
console.log('sitemap:', urls.length, 'pages');
