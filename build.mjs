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
const SITE = 'https://create.unysonplus.com';
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
  { id: 'venue', label: 'Event venue and weddings', desc: 'Date enquiries, tours and bookings' },
  { id: 'professional-service', label: 'Professional service', desc: 'Consultancies, accountants, architects and agencies' }
];

/* True when an industry ships a photograph. A new industry can be added before its art exists;
   without this the picker asked for a missing .webp, fell back to a missing .jpg, and logged a 404. */
const hasArt = (id) => fs.existsSync(path.join(SRC, 'assets', 'img', 'industries', id + '.webp'));

/* Questions every industry page answers. Presets opt in with page.faqCommon. */
const COMMON_FAQ = [
  { q: 'Is it really free?', a: 'Yes. The generator, the Unyson+ plugin and theme, and the AI Dev Kit are free. You only pay for your own hosting and, if you use one, your AI agent subscription.' },
  { q: 'Do I need to know how to code?', a: 'No. You fill in a form and copy the result. Your AI agent does the building. After it is built, the site is edited in the WordPress admin with a visual page builder.' },
  { q: 'Do I need coding tools?', a: 'No. With a paid Claude plan you can build from the normal Claude app: install Unyson+ on a fresh WordPress, click Unyson+ \u2192 Connect AI \u2192 Set up this site for an AI app, add the connector it shows to Claude, and paste the prompt. Claude builds the site through the connector, with no terminal, API key or password. If you prefer a coding agent such as Claude Code, Cursor or Codex, choose it under Build setup instead.' }
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
/* Hero illustration: a mock website in a browser frame, with the CRM pipeline panel over it.
   Industry pages show their own photo as the mock site's main image and their own stage names. */
function heroArt(P) {
  const stages = P.heroStages || ['New', 'Quoted', 'Won'];
  const photo = P.path !== '/' && fs.existsSync(path.join(SRC, 'assets', 'img', 'industries', P.id + '.webp'));
  const label = photo ? `A ${P.label.toLowerCase()} website with a lead pipeline` : 'A business website with a lead pipeline';
  const site = photo ? `
            <defs>
              <clipPath id="artPhotoClip"><rect x="22" y="52" width="396" height="180" rx="8"/></clipPath>
              <linearGradient id="artPhotoShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1f1c" stop-opacity=".1"/><stop offset=".55" stop-color="#0b1f1c" stop-opacity=".25"/><stop offset="1" stop-color="#0b1f1c" stop-opacity=".7"/></linearGradient>
            </defs>
            <g class="art-tile" clip-path="url(#artPhotoClip)">
              <rect x="22" y="52" width="396" height="180" fill="var(--art-photo1)"/>
              ${hasArt(P.id) ? `<image href="/assets/img/industries/${P.id}.webp" x="22" y="52" width="396" height="180" preserveAspectRatio="xMidYMid slice"/>` : ''}
              <rect x="22" y="52" width="396" height="180" fill="url(#artPhotoShade)"/>
            </g>
            <rect x="40" y="166" width="150" height="12" rx="4" fill="#ffffff" opacity=".95"/>
            <rect x="40" y="186" width="104" height="7" rx="3.5" fill="#ffffff" opacity=".75"/>
            <rect x="40" y="202" width="80" height="18" rx="9" fill="var(--accent)"/>
            <rect x="22" y="244" width="124" height="52" rx="6" fill="var(--art-soft2)"/>
            <rect x="34" y="258" width="70" height="7" rx="3.5" fill="var(--art-ink)"/>
            <rect x="34" y="273" width="48" height="6" rx="3" fill="var(--art-soft)"/>
            <rect x="158" y="244" width="124" height="52" rx="6" fill="var(--art-soft2)"/>
            <rect x="170" y="258" width="64" height="7" rx="3.5" fill="var(--art-ink)"/>
            <rect x="170" y="273" width="52" height="6" rx="3" fill="var(--art-soft)"/>` : `
            <rect x="32" y="62" width="150" height="14" rx="4" fill="var(--art-ink)"/>
            <rect x="32" y="84" width="100" height="8" rx="4" fill="var(--art-soft)"/>
            ${[[32, 'art-photo1'], [161, 'art-photo2'], [290, 'art-photo3']].map(([x, c]) => `<g class="art-tile">
              <rect x="${x}" y="108" width="118" height="80" rx="8" fill="var(--${c})"/>
              <path d="M${x + 20} 168 ${x + 42} 146l22 22z" fill="var(--art-photo-ink)" opacity=".35"/>
              <rect x="${x}" y="196" width="80" height="8" rx="4" fill="var(--art-ink)"/>
              <rect x="${x}" y="210" width="56" height="8" rx="4" fill="var(--accent)"/>
            </g>`).join('\n            ')}
            <rect x="32" y="238" width="376" height="50" rx="8" fill="var(--art-soft2)"/>
            <rect x="46" y="256" width="110" height="14" rx="4" fill="var(--art-card)"/>
            <rect x="166" y="256" width="110" height="14" rx="4" fill="var(--art-card)"/>
            <rect x="290" y="252" width="104" height="22" rx="11" fill="var(--accent)"/>`;
  return `<figure class="hero__art" aria-label="Illustration: ${esc(label)}">
        <svg viewBox="0 0 520 420" role="img" aria-labelledby="artTitle">
          <title id="artTitle">${esc(label)}</title>
          <g class="art-site">
            <rect x="10" y="10" width="420" height="300" rx="14" fill="var(--art-card)"/>
            <rect x="10" y="10" width="420" height="34" rx="14" fill="var(--art-chrome)"/>
            <rect x="10" y="30" width="420" height="14" fill="var(--art-chrome)"/>
            <circle cx="32" cy="27" r="5" fill="var(--art-dot)"/><circle cx="48" cy="27" r="5" fill="var(--art-dot)"/><circle cx="64" cy="27" r="5" fill="var(--art-dot)"/>
            <rect x="90" y="20" width="200" height="14" rx="7" fill="var(--art-card)"/>${site}
          </g>
          <g class="art-crm">
            <rect x="236" y="214" width="274" height="196" rx="14" fill="var(--art-panel)"/>
            <rect x="256" y="234" width="90" height="10" rx="5" fill="var(--art-panel-ink)"/>
            <g font-family="inherit" font-size="10" fill="var(--art-panel-soft)">
              <text x="256" y="268">${esc(stages[0])}</text><text x="342" y="268">${esc(stages[1])}</text><text x="428" y="268">${esc(stages[2])}</text>
            </g>
            <g class="art-lead"><rect x="256" y="278" width="74" height="34" rx="6" fill="var(--art-lead)"/><rect x="264" y="287" width="44" height="6" rx="3" fill="var(--art-panel-ink)"/><rect x="264" y="298" width="30" height="6" rx="3" fill="var(--art-panel-soft)"/></g>
            <g class="art-lead"><rect x="256" y="320" width="74" height="34" rx="6" fill="var(--art-lead)"/><rect x="264" y="329" width="50" height="6" rx="3" fill="var(--art-panel-ink)"/><rect x="264" y="340" width="26" height="6" rx="3" fill="var(--art-panel-soft)"/></g>
            <g class="art-lead art-lead--move"><rect x="342" y="278" width="74" height="34" rx="6" fill="var(--accent)"/><rect x="350" y="287" width="40" height="6" rx="3" fill="var(--accent-ink)"/><rect x="350" y="298" width="28" height="6" rx="3" fill="var(--accent-ink)" opacity=".6"/></g>
            <g class="art-lead"><rect x="428" y="278" width="62" height="34" rx="6" fill="var(--art-lead)"/><rect x="436" y="287" width="36" height="6" rx="3" fill="var(--art-panel-ink)"/><rect x="436" y="298" width="24" height="6" rx="3" fill="var(--art-panel-soft)"/></g>
            <rect x="256" y="370" width="234" height="20" rx="6" fill="var(--art-lead)"/>
            <rect x="266" y="377" width="120" height="6" rx="3" fill="var(--art-panel-soft)"/>
          </g>
        </svg>
      </figure>`;
}

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
        { '@type': 'HowToStep', position: 3, name: 'Let Claude build it', text: 'Paste the prompt into a Claude chat with the Unyson+ connector on, or into an AI coding agent. It enables the WordPress features it needs and builds the site.' }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqOf(P).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: strip(f.a) } }))
    }
  ];
  const crumbTrail = trail(P);
  if (crumbTrail.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbTrail.map((c, i) => (
        { '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }
      )),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/* The breadcrumb trail, derived from the path so the markup and the JSON-LD cannot disagree.
   Both used to hardcode "CRM Website Generator" pointing at "/", which was true while the CRM
   generator WAS the root. It no longer is: / is the Site Creator and the CRM family lives at /crm/.
   Left alone, the hub listed itself under its own child ("CRM Website Generator / Any business") and
   every industry page skipped the family it belongs to. Returns [] for the home. */
function trail(P) {
  if (P.path === '/') return [];
  const out = [{ name: 'Site Creator', item: SITE + '/' }];
  if (P.path.startsWith('/crm/')) {
    out.push({ name: 'CRM websites', item: SITE + '/crm/' });
    // the hub IS that entry - do not list it again as its own child
    if (P.path === '/crm/') return out;
  }
  out.push({ name: P.label, item: SITE + P.path });
  return out;
}

function head(P, v) {
  const url = SITE + P.path;
  const og = fs.existsSync(path.join(SRC, 'assets', 'og', P.id + '.jpg')) ? `${SITE}/assets/og/${P.id}.jpg` : `${SITE}/assets/og-image.png`;
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
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(P.page.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(P.page.h1)}">
<meta name="twitter:description" content="${esc(P.page.description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" as="image" href="/assets/img/hero-bg.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Open+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/style.css?v=${v.css}">
<script type="application/ld+json">
${jsonLd(P)}
</script>
</head>`;
}

function topbar(o) {
  const app = (o && o.app) || 'CRM Generator';
  const nav = (o && o.nav) || [
    ['#how', 'How it works'], ['/crm/#industries', 'Industries'], ['#faq', 'FAQ'],
    ['https://docs.unysonplus.com/guides/crm-generator', 'Docs'],
  ];
  return `<header class="top">
  <div class="wrap top__in">
    <a class="logo" href="/" aria-label="Unyson+ Site Creator home">
      <img src="/assets/img/unysonplus-logo.png" width="174" height="40" alt="Unyson+ Framework">
      <span class="logo__app">${esc(app)}</span>
    </a>
    <nav aria-label="Main">
      ${nav.map(([h, t]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('\n      ')}
    </nav>
  </div>
</header>`;
}

function hero(P) {
  const t = trail(P);
  const crumbs = !t.length ? '' : `<nav class="crumbs" aria-label="Breadcrumb">${t.map((c, i) => (
    i === t.length - 1
      ? `<span aria-current="page">${esc(c.name)}</span>`
      : `<a href="${esc(c.item.replace(SITE, '') || '/')}">${esc(c.name)}</a>`
  )).join(' <span aria-hidden="true">/</span> ')}</nav>\n        `;
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
      ${heroArt(P)}
    </div>
  </section>`;
}

function picker() {
  const img = (i) => (!hasArt(i.id) ? '' : `<span class="ind__img"><picture><source srcset="/assets/img/industries/${i.id}.webp" type="image/webp"><img src="/assets/img/industries/${i.id}.jpg" alt="" width="960" height="600" loading="lazy" decoding="async"></picture></span>`);
  const items = INDUSTRIES.map((i) => {
    const live = presets[i.id];
    const body = `${img(i)}<b>${esc(i.label)}</b><span class="ind__desc">${esc(i.desc)}</span>`;
    return live
      ? `<li class="ind ind--live"><a href="${live.path}">${body}<em>Open the generator</em></a></li>`
      : `<li class="ind"><div>${body}<em>Coming soon</em></div></li>`;
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
            <div class="row">
              ${input('bizEmail', 'Public email', { hint: 'optional', type: 'email', placeholder: 'hello@yourdomain.com' })}
              ${input('hours', 'Opening hours', { hint: 'optional', placeholder: 'Mon–Fri 9am–5pm, Sat 10am–2pm' })}
            </div>
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
              ${select('track', 'How will you build?', [{ value: 'app', label: 'In the Claude app', selected: true }, { value: 'agent', label: 'With a coding agent' }])}
              ${select('wp', 'Your fresh WordPress is', [{ value: 'host', label: 'On my web host', selected: true }, { value: 'local', label: 'On my computer (local)' }])}
            </div>
            <div class="row" id="agentRow" hidden>
              ${select('agent', 'AI agent', [{ value: 'claude-code', label: 'Claude Code', selected: true }, { value: 'cursor', label: 'Cursor' }, { value: 'codex', label: 'Codex' }, { value: 'other', label: 'Another coding agent' }])}
              <div id="accessField" hidden>${select('access', 'How the agent reaches your host', [{ value: 'migrate', label: 'Build locally, move it later', selected: true }, { value: 'ssh', label: 'SSH (with WP-CLI)' }, { value: 'apppass', label: 'Only the WordPress admin' }])}</div>
              <div id="localField" hidden>${select('localtool', 'Local WordPress tool', [{ value: 'local', label: 'Local', selected: true }, { value: 'studio', label: 'WordPress Studio' }, { value: 'xampp', label: 'XAMPP, WAMP or MAMP' }, { value: 'other', label: 'Something else' }])}</div>
            </div>
            <p class="note" id="trackNote" aria-live="polite"></p>
            <p class="hint-line">Start from a <b>fresh</b> WordPress (or your host's staging copy), never a site with real content. <a href="https://docs.unysonplus.com/guides/crm-generator-setup">Need WordPress first, or help with the setup?</a></p>
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
            <button type="button" class="btn btn--ghost-dark" id="resume" hidden>Copy resume message</button>
          </div>
          <p class="out__status" id="status" role="status" aria-live="polite"></p>
        </aside>
      </div>
    </div>
  </section>`;
}

function how(P) {
  const icon = {
    // Feature switches.
    choose: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
    // A structured file.
    copy: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M10 12.5c-.8 0-1 .5-1 1.2s-.4 1.3-1 1.3c.6 0 1 .6 1 1.3s.2 1.2 1 1.2M14 12.5c.8 0 1 .5 1 1.2s.4 1.3 1 1.3c-.6 0-1 .6-1 1.3s-.2 1.2-1 1.2"/></svg>',
    // A finished site.
    build: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01"/><path d="m9 14.5 2 2 4-4"/></svg>',
  };
  return `<section id="how" class="how" aria-labelledby="howTitle">
    <div class="wrap">
      <div class="how__head">
        <h2 id="howTitle">How it works</h2>
        <p>You make the choices on this page. Your AI agent does the building, on your own WordPress site.</p>
      </div>
      <ol class="steps">
        <li class="step" style="--i:0">
          <span class="step__icon" aria-hidden="true">${icon.choose}</span>
          <h3>Choose your features</h3>
          <p>Start from ${P.id === 'any-business' ? 'a description of your business' : 'the ' + esc(P.label.toLowerCase()) + ' preset'} and switch on the pages, ${esc(P.content.legend.toLowerCase())}, lead forms and pipeline stages you need. Pick your colors and style.</p>
          <a class="step__link" href="#generator">Open the generator<span aria-hidden="true">&nbsp;&rarr;</span></a>
          <span class="step__deco" aria-hidden="true"></span>
          <span class="step__num" aria-hidden="true">01</span>
        </li>
        <li class="step" style="--i:1">
          <span class="step__icon" aria-hidden="true">${icon.copy}</span>
          <h3>Copy the prompt and spec</h3>
          <p>The prompt tells your agent what to build and in what order. <code>site-spec.json</code> holds every choice in a structured file, so the result does not depend on how the agent reads a paragraph.</p>
          <span class="step__deco" aria-hidden="true"></span>
          <span class="step__num" aria-hidden="true">02</span>
        </li>
        <li class="step step--result" style="--i:2">
          <span class="step__icon" aria-hidden="true">${icon.build}</span>
          <h3>Your AI agent builds the site</h3>
          <p>Paste the prompt into a Claude chat with the Unyson+ connector on (no coding tools needed), or into Claude Code, Cursor, Codex or another coding agent. It reads the Unyson+ build docs, enables the right features and builds the pages, forms and CRM on your WordPress site.</p>
          <a class="step__link" href="#included">See what gets built<span aria-hidden="true">&nbsp;&rarr;</span></a>
          <span class="step__deco" aria-hidden="true"></span>
          <span class="step__num" aria-hidden="true">03</span>
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

function closing(o) {
  const title = (o && o.title) || 'Your CRM website is a form away';
  const body = (o && o.body) || 'Pick your features, copy the prompt, and let your AI agent build it on WordPress. Free, with no account to create.';
  const cta = (o && o.cta) || 'Build my CRM site';
  const href = (o && o.href) || '#generator';
  return `<section class="cta" aria-labelledby="ctaTitle">
    <div class="wrap cta__in">
      <h2 id="ctaTitle">${esc(title)}</h2>
      <p>${esc(body)}</p>
      <a class="btn btn--accent" href="${esc(href)}">${esc(cta)}</a>
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

/* ---------- the general Site Creator home ----------
   A different KIND of page from a generator: it explains the four ways in, routes to a family, and
   offers the one thing a visitor with the kit installed actually wants (open it locally). It is not a
   fifth form — the forms live per-family (/crm/) and in the kit's own Create tab. Duplicating the
   intake here would mean two of them drifting apart.

   The kit button is progressive enhancement: the page is complete and useful with the probe failing,
   which is the normal case for someone meeting this for the first time. */
function homePage(v) {
  const P = {
    id: 'site-creator',
    path: '/',
    label: 'Site Creator',
    page: {
      title: 'Free Website Generator for WordPress | Unyson+ Site Creator',
      description: 'Describe your business and get a complete, editable WordPress site built on the free Unyson+ framework by your own AI agent \u2014 native page-builder pages, not throwaway markup.',
      h1: 'Build a WordPress site from a description',
      lede: 'Tell it what the business is. Get a site your agent builds on WordPress with Unyson+ \u2014 real page-builder pages, a design system you can change, and nothing invented.',
      note: 'Free. Runs in your own AI agent, on your own machine.',
      ogAlt: 'The Unyson+ Site Creator',
      schemaName: 'Unyson+ Site Creator',
      // jsonLd builds an FAQPage from these; the home page carries no FAQ of its own.
      faq: [], faqCommon: false,
    },
    // jsonLd() reads content.legend to describe the generator's first step. The home page has no
    // generator form, so it supplies the phrase directly rather than head() growing a special case.
    content: { legend: 'what the site needs' },
  };
  const route = (t, d) => `<li class="ind"><div><b>${esc(t)}</b><span class="ind__desc">${esc(d)}</span></div></li>`;
  return `${head(P, v)}
<body>
<a class="skip" href="#start">Skip to the start</a>
${topbar({ app: 'Site Creator', nav: [['#start', 'How it works'], ['/crm/', 'CRM websites'], ['https://docs.unysonplus.com/create-a-site', 'Docs']] })}
<main>
  <section class="hero">
    <div class="wrap hero__in">
      <div class="hero__copy">
        <h1>${esc(P.page.h1)}</h1>
        <p class="lede">${esc(P.page.lede)}</p>
        <p class="note">${esc(P.page.note)}</p>
      </div>
    </div>
  </section>

  <section id="start" class="pick" aria-labelledby="startTitle">
    <div class="wrap">
      <div class="pick__head">
        <h2 id="startTitle">Four ways in</h2>
        <p>The same build, started from whatever you already have.</p>
      </div>
      <ul class="pick__list">
        ${route('A description', 'Say what the business is. The only route that needs nothing else.')}
        ${route('A reference site', 'Point at a URL. It is captured and rebuilt as editable Unyson+ pages.')}
        ${route('A design you like', 'A screenshot or mockup. The look is read into a design system; the content is yours.')}
        ${route('An industry template', 'Start from a template for your trade, then fill in the facts.')}
      </ul>
    </div>
  </section>

  <section class="pick" aria-labelledby="famTitle">
    <div class="wrap">
      <div class="pick__head">
        <h2 id="famTitle">Start from a kind of site</h2>
        <p>A family sets the pages, the forms and the words your trade actually uses. Pick the one
        that fits, then your industry inside it.</p>
      </div>
      <ul class="pick__list">
        <li class="ind ind--live"><a href="/crm/"><b>CRM website</b><span class="ind__desc">A site with a client pipeline, lead forms and follow-up emails. Nine industries: salons, clinics, gyms, trades, law firms, estate agents, recruiters, venues and professional services.</span><em>Open the generator</em></a></li>
        <li class="ind"><div><b>Ecommerce</b><span class="ind__desc">A shop on WooCommerce — products, cart and checkout, which is a different surface rather than another sitemap.</span><em>Coming soon</em></div></li>
        <li class="ind"><div><b>SaaS or product</b><span class="ind__desc">Apps, developer tools and plugins — pricing tiers, feature pages and a trial funnel.</span><em>Coming soon</em></div></li>
      </ul>
    </div>
  </section>

  <section class="pick" aria-labelledby="styleTitle">
    <div class="wrap">
      <div class="pick__head">
        <h2 id="styleTitle">Pick how it looks</h2>
        <p>A style is a set of Theme Settings — palette, type, button shape, surfaces — applied across the
        whole site rather than to each element. You can change any of it afterwards in WordPress.</p>
      </div>
      <div class="stylep__grid">
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/monochrome/">
            <img src="/assets/img/styles/monochrome.jpg" width="1280" height="967" loading="lazy" decoding="async"
                 alt="A monochrome editorial style: a large serif headline in black on white, a square-cornered black button, and a pale grey band below it.">
          </a>
          <figcaption>
            <b>Monochrome editorial</b>
            <span>Pure black on white, serif display type, square corners, three surfaces. <a href="/design-presets/monochrome/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/bauhaus/">
            <img src="/assets/img/styles/bauhaus.jpg" width="1280" height="1150" loading="lazy" decoding="async"
                 alt="A Bauhaus style: a heavy uppercase headline beside a blue panel holding a yellow circle, a red rotated square and a white square, over a yellow band of statistics.">
          </a>
          <figcaption>
            <b>Bauhaus</b>
            <span>Primary colour blocking, thick black borders, hard offset shadows. <a href="/design-presets/bauhaus/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/modern-dark/">
            <img src="/assets/img/styles/modern-dark.jpg" width="1280" height="900" loading="lazy" decoding="async"
                 alt="A modern dark style: a large gradient headline on a near-black canvas lit by soft indigo, an indigo button, and an elevated mock application panel below.">
          </a>
          <figcaption>
            <b>Modern dark</b>
            <span>Near-black canvas, layered ambient light, one indigo accent. <a href="/design-presets/modern-dark/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/newsprint/">
            <img src="/assets/img/styles/newsprint.jpg" width="1280" height="786" loading="lazy" decoding="async"
                 alt="A newsprint style: a masthead with edition metadata above a very large serif headline, a visible column rule, and a black news ticker with red badges.">
          </a>
          <figcaption>
            <b>Newsprint</b>
            <span>A visible collapsed grid, four serif and sans faces, one editorial red. <a href="/design-presets/newsprint/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/saas/">
            <img src="/assets/img/styles/saas.jpg" width="1280" height="810" loading="lazy" decoding="async"
                 alt="A minimalist modern style: a warm off-white page with a large serif headline whose last word is filled with an electric blue gradient, beside a white panel with a gradient border.">
          </a>
          <figcaption>
            <b>Minimalist Modern</b>
            <span>Warm off-white, a dual-font pairing, one electric blue gradient. <a href="/design-presets/saas/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/luxury/">
            <img src="/assets/img/styles/luxury.jpg" width="1280" height="1049" loading="lazy" decoding="async"
                 alt="A luxury editorial style: a very large serif headline with one italic word on warm off-white, faint vertical gridlines, and a tall greyscale plate to the right.">
          </a>
          <figcaption>
            <b>Luxury / Editorial</b>
            <span>Warm alabaster and charcoal, a visible grid, cinematic motion. <a href="/design-presets/luxury/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/terminal/">
            <img src="/assets/img/styles/terminal.jpg" width="1280" height="857" loading="lazy" decoding="async"
                 alt="A terminal style: phosphor green monospace text on near-black with a blinking block cursor, bracketed buttons and ASCII progress bars.">
          </a>
          <figcaption>
            <b>Terminal CLI</b>
            <span>Monospace throughout, phosphor on near-black, panes and ASCII rules. <a href="/design-presets/terminal/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/swiss/">
            <img src="/assets/img/styles/swiss.jpg" width="1280" height="933" loading="lazy" decoding="async"
                 alt="A Swiss style: a very large black uppercase headline on white over a faint grid, beside a composition of a red circle and a black rectangle.">
          </a>
          <figcaption>
            <b>Swiss International</b>
            <span>A visible grid, massive neutral type, one signal red. <a href="/design-presets/swiss/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/kinetic/">
            <img src="/assets/img/styles/kinetic.jpg" width="1280" height="1136" loading="lazy" decoding="async"
                 alt="A kinetic style: enormous uppercase type filling the screen on rich black with one word in acid yellow, above a scrolling yellow marquee.">
          </a>
          <figcaption>
            <b>Kinetic Typography</b>
            <span>Viewport-scale type, continuous marquees, hard inversions. <a href="/design-presets/kinetic/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/flat-design/">
            <img src="/assets/img/styles/flat-design.jpg" width="1280" height="775" loading="lazy" decoding="async"
                 alt="A flat style: a bold headline in dark ink on a full-bleed blue section with a composition of flat circles and rectangles beside it.">
          </a>
          <figcaption>
            <b>Flat Design</b>
            <span>No shadows at all, full-section colour blocking, bold geometric type. <a href="/design-presets/flat-design/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/art-deco/">
            <img src="/assets/img/styles/art-deco.jpg" width="1280" height="840" loading="lazy" decoding="async"
                 alt="An Art Deco style: gold uppercase type centred on obsidian inside a thin gold frame with stepped corner brackets, under a soft golden sunburst.">
          </a>
          <figcaption>
            <b>Art Deco</b>
            <span>Obsidian and gold, stepped corners, glows instead of shadows. <a href="/design-presets/art-deco/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/material-design/">
            <img src="/assets/img/styles/material-design.jpg" width="1280" height="572" loading="lazy" decoding="async"
                 alt="A Material You style: a large tinted lavender panel with rounded corners, pill buttons and a floating white card of rounded list rows.">
          </a>
          <figcaption>
            <b>Material You</b>
            <span>Tonal surfaces, pill buttons, generous rounding. <a href="/design-presets/material-design/">See it as a page →</a></span>
          </figcaption>
        </figure>
        <figure class="stylep">
          <a class="stylep__link" href="/design-presets/neo-brutalism/">
            <img src="/assets/img/styles/neo-brutalism.jpg" width="1280" height="979" loading="lazy" decoding="async"
                 alt="A Neo-brutalist style: a heavy uppercase headline, half of it hollow, on cream, beside rotated stickers and a row of bordered stat blocks with hard black shadows.">
          </a>
          <figcaption>
            <b>Neo-brutalism</b>
            <span>4px black borders, hard offset shadows, black on every colour. <a href="/design-presets/neo-brutalism/">See it as a page →</a></span>
          </figcaption>
        </figure>
      </div>
      <p class="stylep__note">More presets are being added. Tell the creator which one you want, or let it choose from your brief.</p>
    </div>
  </section>

  <section class="pick" aria-labelledby="kitTitle">
    <div class="wrap">
      <div class="pick__head">
        <h2 id="kitTitle">Already have the AI Dev Kit?</h2>
        <p>The kit runs on your own computer and does the building. If it is running now, you can go straight to it.</p>
      </div>
      <div id="kitBox" class="kit-box" data-state="checking">
        <p id="kitMsg">Looking for the AI Dev Kit on this computer\u2026</p>
        <p id="kitActions"></p>
      </div>
    </div>
  </section>

  ${closing({
    title: 'Start with a description',
    body: 'Say what the business is and let your AI agent build it on WordPress with Unyson+. Free, with no account to create.',
    cta: 'Choose your industry',
    href: '/crm/',
  })}
</main>
${footer()}
<script>
/* Finds the kit the same way the Kinetic Scenes Studio does: straight from this page to the service on
   the person's own machine, never through a server. The two states that matter are told apart on
   purpose \u2014 "no kit" and "the browser refused to let this page reach it" look identical from here, and
   telling someone to install software they already have is the one unhelpful outcome available. */
(function () {
  var BASES = ['http://localhost:8787', 'http://127.0.0.1:8787'];
  var box = document.getElementById('kitBox');
  var msg = document.getElementById('kitMsg');
  var act = document.getElementById('kitActions');
  if (!box) return;

  function set(state, text, html) {
    box.setAttribute('data-state', state);
    msg.textContent = text;
    act.innerHTML = html || '';
  }

  function blockedCheck() {
    try {
      return navigator.permissions.query({ name: 'local-network-access' })
        .then(function (p) { return p.state; }).catch(function () { return 'unknown'; });
    } catch (e) { return Promise.resolve('unknown'); }
  }

  var tried = 0;
  function probe(i) {
    if (i >= BASES.length) {
      return blockedCheck().then(function (perm) {
        if (perm === 'denied') {
          set('blocked',
            'The kit may be running, but this browser is blocking the page from reaching apps on your computer.',
            '<a class="btn btn--accent" href="https://docs.unysonplus.com/create-a-site" target="_blank" rel="noopener">How to allow it</a>');
        } else {
          set('missing',
            'The AI Dev Kit is not running on this computer.',
            '<a class="btn btn--accent" href="https://docs.unysonplus.com/get-the-kit" target="_blank" rel="noopener">Get the kit</a> ' +
            '<a class="btn" href="https://docs.unysonplus.com/create-a-site" target="_blank" rel="noopener">How to start</a>');
        }
      });
    }
    return fetch(BASES[i] + '/health', { signal: AbortSignal.timeout(2500) })
      .then(function (r) {
        if (!r.ok) throw new Error('not ok');
        set('ready',
          'The AI Dev Kit is running on this computer.',
          '<a class="btn btn--accent" href="http://localhost:4600/#create">Open it in the kit</a>');
      })
      .catch(function () { return probe(i + 1); });
  }
  probe(0);
})();
</script>
</body>
</html>
`;
}

function page(P, v) {
  return `${head(P, v)}
<body>
<a class="skip" href="#generator">Skip to the generator</a>
${topbar()}
<main>
  ${hero(P)}
  ${P.path === '/crm/' ? picker() : ''}
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
<!-- Default Statcounter code for Unyson+ Site Creator https://create.unysonplus.com/ -->
<script type="text/javascript">
var sc_project=13359821;
var sc_invisible=1;
var sc_security="ed7f5fa3";
</script>
<script type="text/javascript" src="https://www.statcounter.com/counter/counter.js" async></script>
<noscript><div class="statcounter"><a title="web stats" href="https://statcounter.com/" target="_blank"><img class="statcounter" src="https://c.statcounter.com/13359821/0/ed7f5fa3/1/" alt="web stats" referrerPolicy="no-referrer-when-downgrade"></a></div></noscript>
<!-- End of Statcounter Code -->
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

/* ---------- redirect stubs for the pre-move URLs ----------
   The industry pages used to live at /<industry>-crm-website/ on crm.unysonplus.com, back when CRM was
   the whole site and the slug had to carry the subject. Under create.unysonplus.com the family is the
   path segment, so the slug no longer repeats it.

   GitHub Pages serves static files: there is no 301 to issue and no .htaccess to write. A stub page with
   a zero-delay meta refresh plus a canonical is the available equivalent, and search engines treat it as
   a redirect. These are emitted by the build, not hand-maintained, so they cannot drift from the moves
   map — and they are cheap to delete in a year.

   Deliberately NOT noindex: the canonical is what passes any equity to the new URL, and a noindex on the
   same page fights it. */
const MOVED = {
  '/dental-clinic-crm-website/': '/crm/dental-clinic/',
  '/event-venue-crm-website/': '/crm/event-venue/',
  '/gym-crm-website/': '/crm/gym/',
  '/home-services-crm-website/': '/crm/home-services/',
  '/law-firm-crm-website/': '/crm/law-firm/',
  '/real-estate-crm-website/': '/crm/real-estate/',
  '/recruitment-agency-crm-website/': '/crm/recruitment-agency/',
  '/salon-spa-crm-website/': '/crm/salon-spa/',
};
for (const [from, to] of Object.entries(MOVED)) {
  const dir = path.join(OUT, from);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Moved \u2014 ${SITE}${to}</title>
<link rel="canonical" href="${SITE}${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:16px/1.6 system-ui,sans-serif;margin:4rem auto;max-width:34rem;padding:0 1rem;color:#111}</style>
</head><body>
<h1>This page has moved</h1>
<p>It now lives at <a href="${to}">${SITE}${to}</a>.</p>
<script>location.replace(${JSON.stringify(to)});</script>
</body></html>
`);
  console.log('redirect', from, '->', to);
}

fs.writeFileSync(path.join(OUT, 'index.html'), homePage(v));
urls.push('/');
console.log('built / (Site Creator home)');

urls.sort((a, b) => a.length - b.length);
// Hand-authored pages under src/static/ are copied verbatim rather than generated, so they are not in
// `urls` and would otherwise be absent from the sitemap - invisible to search despite being real pages.
urls.push('/design-presets/monochrome/', '/design-presets/bauhaus/', '/design-presets/modern-dark/', '/design-presets/newsprint/', '/design-presets/saas/', '/design-presets/luxury/', '/design-presets/terminal/', '/design-presets/swiss/', '/design-presets/kinetic/', '/design-presets/flat-design/', '/design-presets/art-deco/', '/design-presets/material-design/', '/design-presets/neo-brutalism/');

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
