/* The general website generator.
 *
 * The description-first route: the person says what the business is, and this emits
 * (1) a build prompt for their AI agent and (2) a `site-spec.json` conforming to the
 * AI Dev Kit's skills/create-site/site-spec.schema.json with `source: "brief"`.
 *
 * It is deliberately NOT built on the CRM generator's engine. That engine's state is
 * pipeline-shaped - stages, blueprints, extra fields, also-install - and a brief shares
 * almost none of it; folding this in would mean a preset that ignores most of the engine
 * and an engine that grows branches for a second product. The two share the output panel's
 * markup and CSS instead, which is the part that actually is the same.
 *
 * The six questions come from the kit's own intake (skills/create-site/inputs/brief.md):
 * the business, the pages, the style, the one action, real content, where it is built.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: anything the person does not tell us goes into
 * `missing[]` rather than being filled in with something plausible. The schema calls that
 * "THE MOST IMPORTANT FIELD", and the build reads it as "do not invent these".
 */
(function () {
  'use strict';

  var form = document.getElementById('cform');
  if (!form) return;

  var STYLES = window.UPWSTYLES || [];
  var KEY = 'upw-creator-v1';

  /* ---------- small helpers (same vocabulary as the CRM engine) ---------- */
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function lines(s) {
    return String(s || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  }
  function val(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }
  function checked(name) {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="' + name + '"]:checked'),
      function (i) { return i.value; }
    );
  }
  function radio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function styleBy(id) {
    for (var i = 0; i < STYLES.length; i++) if (STYLES[i].slug === id) return STYLES[i];
    return null;
  }

  /* ---------- the page catalogue ----------
     Each entry carries the SHAPE the schema knows about and a default purpose. The purpose
     is a sentence about what the page is for, not about this business - the agent writes the
     copy, and a purpose that asserted facts would be inventing them here instead. */
  var PAGES = {
    home:      { title: 'Home',      shape: 'home',     purpose: 'The front page: what the business does, who it is for, and the one action.' },
    about:     { title: 'About',     shape: 'about',    purpose: 'Who is behind the business and why someone should trust it.' },
    services:  { title: 'Services',  shape: 'services', purpose: 'What is offered, as a list that can grow, each item with its own detail.' },
    work:      { title: 'Work',      shape: 'custom',   purpose: 'Examples of past work, as a gallery or case studies.' },
    pricing:   { title: 'Pricing',   shape: 'pricing',  purpose: 'What it costs, in tiers or from-prices, with one clear next step.' },
    blog:      { title: 'Blog',      shape: 'custom',   purpose: 'An article index, for search and for saying something regularly.' },
    faq:       { title: 'FAQ',       shape: 'custom',   purpose: 'The questions that come up before someone gets in touch.' },
    contact:   { title: 'Contact',   shape: 'contact',  purpose: 'How to reach the business, with the form that captures an enquiry.' }
  };

  var ACTIONS = {
    book:     { label: 'Book an appointment', cta: 'Book now',      form: 'booking' },
    call:     { label: 'Call',                cta: 'Call us',       form: null },
    enquire:  { label: 'Send an enquiry',     cta: 'Get in touch',  form: 'contact' },
    quote:    { label: 'Request a quote',     cta: 'Get a quote',   form: 'quote' },
    buy:      { label: 'Buy online',          cta: 'Shop now',      form: null },
    signup:   { label: 'Sign up or subscribe', cta: 'Get started',  form: 'newsletter' },
    download: { label: 'Download something',  cta: 'Download',      form: 'contact' }
  };

  /* ---------- read the form into a flat state ---------- */
  function readState() {
    return {
      name: val('name'),
      describe: val('describe'),
      market: val('market'),
      type: val('type'),
      phone: val('phone'),
      email: val('email'),
      pages: checked('pages'),
      extraPages: lines(val('extraPages')),
      style: val('style'),
      styleNotes: val('styleNotes'),
      action: radio('action'),
      has: checked('has'),
      target: val('target'),
      agent: val('agent'),
      publish: radio('publish') || 'draft'
    };
  }

  /* ---------- state -> site spec ----------
     Every empty answer becomes a missing[] id rather than a guess. */
  function toSpec(s) {
    var missing = [];
    function orNull(v, id) { if (v) return v; missing.push(id); return null; }

    var picked = s.pages.slice();
    if (picked.indexOf('home') === -1) picked.unshift('home');

    var pages = picked.map(function (k) {
      var p = PAGES[k];
      return { slug: k === 'home' ? '' : k, title: p.title, purpose: p.purpose, shape: p.shape, sections: null };
    }).concat(s.extraPages.map(function (t) {
      return { slug: slug(t), title: t, purpose: 'A page the person asked for by name; ask what it is for before building it.', shape: 'custom', sections: null };
    }));

    var st = styleBy(s.style);
    var has = s.has;

    /* proof[] carries ONLY what was actually supplied, and nothing is supplied through a
       form like this one - at most the person tells us such material exists. So the arrays
       stay empty either way and the distinction goes into missing[]:
         not ticked -> `proof.testimonials`         none exist; build no proof band
         ticked     -> `proof.testimonials.content` they exist; collect them before building
       The schema is blunt about why: "an invented testimonial is not a placeholder, it is a
       fabricated claim about a real business." */
    function proofGap(k, id) { missing.push(has.indexOf(k) !== -1 ? id + '.content' : id); }
    proofGap('testimonials', 'proof.testimonials');
    proofGap('numbers', 'proof.metrics');

    var spec = {
      spec_version: 1,
      source: 'brief',
      vertical: null,
      business: {
        name: s.name || '[Business name]',
        type: s.type || null,
        tagline: null,
        market: orNull(s.market, 'business.market'),
        language: 'en',
        phone: orNull(s.phone, 'business.phone'),
        email: orNull(s.email, 'business.email'),
        address: null,
        hours: null
      },
      pages: pages,
      brand: {
        style: s.style === 'custom' ? 'custom' : (s.style || 'monochrome'),
        style_notes: s.style === 'custom' ? (s.styleNotes || null) : (st ? st.blurb : null),
        primary: null,
        accent: null,
        logo: has.indexOf('logo') !== -1 ? 'supplied' : 'text'
      },
      primary_action: s.action || 'enquire',
      proof: { testimonials: [], logos: [], metrics: [] },
      seo: {
        title_pattern: s.name ? '%page% | ' + s.name : null,
        description: s.describe || null,
        schema_type: 'LocalBusiness',
        local: !!s.market
      },
      content: null,
      build: {
        target: s.target || '[the WordPress install]',
        publish: s.publish,
        extensions: extensionsFor(s),
        theme: 'unysonplus-theme'
      },
      missing: missing
    };

    if (!s.name) missing.unshift('business.name');
    if (!s.describe) missing.push('business.description');
    if (!s.target) missing.push('build.target');
    if (has.indexOf('copy') === -1) missing.push('content.copy');
    if (has.indexOf('photos') === -1) missing.push('content.photos');

    return spec;
  }

  function extensionsFor(s) {
    var ext = ['page-builder', 'shortcodes'];
    var a = ACTIONS[s.action];
    if (a && a.form) ext.push('forms');
    if (s.pages.indexOf('blog') !== -1) ext.push('blog');
    if (s.pages.indexOf('work') !== -1) ext.push('portfolio');
    if (s.action === 'buy') ext.push('woocommerce');
    ext.push('seo');
    return ext;
  }

  /* ---------- state -> prompt ---------- */
  function toPrompt(s, spec) {
    var a = ACTIONS[s.action] || ACTIONS.enquire;
    var st = styleBy(s.style);
    var out = [];

    out.push('Build a WordPress website with Unyson+.');
    out.push('');
    out.push('## The business');
    out.push('- Name: ' + (s.name || '[tell the agent the business name]'));
    out.push('- What it does: ' + (s.describe || '[describe the business]'));
    if (s.market) out.push('- Where: ' + s.market);
    if (s.type) out.push('- Size: ' + s.type);
    if (s.phone) out.push('- Phone: ' + s.phone);
    if (s.email) out.push('- Email: ' + s.email);
    out.push('');

    out.push('## The pages');
    spec.pages.forEach(function (p) {
      out.push('- **' + p.title + '** (`/' + p.slug + '`) — ' + p.purpose);
    });
    out.push('');
    out.push('Propose the sections for each page before building, and say which archetypes you are using.');
    out.push('');

    out.push('## The look');
    if (s.style === 'custom') {
      out.push('- Style: described below, not one of the library presets.');
      out.push('- ' + (s.styleNotes || '[describe the look you want]'));
    } else if (st) {
      out.push('- Style: **' + st.label + '** (`' + st.slug + '`) — ' + st.blurb);
      out.push('- Apply it through Theme Settings and presets, not as CSS on each element.');
      out.push('- The brief for it is in the kit at `docs/site-creator/styles/prompts/' + st.slug + '.md`,');
      out.push('  and there is a rendered page at https://create.unysonplus.com/design-presets/' + st.slug + '/');
    }
    out.push('');

    out.push('## The one action');
    out.push('- A visitor should: **' + a.label.toLowerCase() + '**. Every call to action points there.');
    out.push('- Header button and primary CTA: "' + a.cta + '".');
    if (a.form) out.push('- Build a ' + a.form + ' form with the Forms extension; store every submission as an entry, not only an email.');
    out.push('');

    out.push('## What I already have');
    var hasLabels = { copy: 'written copy', photos: 'photographs', logo: 'a logo', testimonials: 'testimonials', numbers: 'real numbers or results' };
    var hasList = s.has.map(function (k) { return hasLabels[k]; }).filter(Boolean);
    out.push(hasList.length ? '- ' + hasList.join(', ') + '. Ask me for these before writing placeholders.' : '- Nothing yet.');
    out.push('');

    out.push('## Build');
    out.push('- Target install: ' + (s.target || '[which WordPress install]'));
    out.push('- Publish state: ' + s.publish + (s.publish === 'draft' ? ' — do not publish until I say so.' : ''));
    out.push('- Extensions to activate: ' + spec.build.extensions.join(', ') + '.');
    out.push('');

    out.push('## Do not invent');
    if (spec.missing.length) {
      out.push('These are not established. Ask me, or leave the element out — do not fill them with plausible text:');
      spec.missing.forEach(function (m) { out.push('- `' + m + '`'); });
    } else {
      out.push('Everything above is established. Anything else you need, ask before assuming.');
    }
    out.push('');
    out.push('Follow the create-site skill in the Unyson+ AI Dev Kit. The site spec below is the same');
    out.push('information in the form the skill reads.');
    out.push('');
    out.push('```json');
    out.push(JSON.stringify(spec, null, 2));
    out.push('```');

    return out.join('\n');
  }

  /* ---------- a plain-language preview of what gets built ---------- */
  function toPreview(s, spec) {
    var a = ACTIONS[s.action] || ACTIONS.enquire;
    var st = styleBy(s.style);
    var h = [];
    h.push('<h3>' + esc(s.name || 'Your site') + '</h3>');
    h.push('<p class="prev__lede">' + esc(s.describe || 'Describe the business and this fills in.') + '</p>');
    h.push('<p class="prev__row"><b>Pages</b> ' + esc(spec.pages.map(function (p) { return p.title; }).join(' · ')) + '</p>');
    h.push('<p class="prev__row"><b>Look</b> ' + esc(s.style === 'custom' ? 'described by you' : (st ? st.label : '—')) + '</p>');
    h.push('<p class="prev__row"><b>One action</b> ' + esc(a.label) + '</p>');
    h.push('<p class="prev__row"><b>Extensions</b> ' + esc(spec.build.extensions.join(', ')) + '</p>');
    if (spec.missing.length) {
      h.push('<p class="prev__miss"><b>' + spec.missing.length + ' thing' + (spec.missing.length === 1 ? '' : 's') +
        ' the agent must not invent</b><br>' + esc(spec.missing.join(', ')) + '</p>');
    }
    return h.join('\n');
  }
  function esc(x) {
    return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- render ---------- */
  var promptOut = document.getElementById('cPromptOut');
  var specOut = document.getElementById('cSpecOut');
  var previewOut = document.getElementById('cPreviewOut');
  var meta = document.getElementById('cMeta');
  var statusEl = document.getElementById('cStatus');
  var styleLink = document.getElementById('cStyleLink');
  var styleMini = document.getElementById('cStyleMini');
  var styleThumb = document.getElementById('cStyleThumb');
  var styleImg = document.getElementById('cStyleImg');
  var styleDesc = document.getElementById('cStyleDesc');
  var notesField = document.getElementById('cNotesField');
  var lastPrompt = '';

  function render() {
    var s = readState();
    var st = styleBy(s.style);
    var spec = toSpec(s);
    lastPrompt = toPrompt(s, spec);

    promptOut.textContent = lastPrompt;
    specOut.textContent = JSON.stringify(spec, null, 2);
    previewOut.innerHTML = toPreview(s, spec);

    meta.textContent = spec.pages.length + ' pages · ' + spec.missing.length + ' to confirm';

    if (notesField) notesField.hidden = s.style !== 'custom';

    /* A glimpse of the look under the dropdown. The image is only pointed at a file once a
       style is chosen, so nothing is fetched for the 'Pick a style' default or for the
       describe-your-own path, where there is no preset to show. */
    var showMini = !!(st && s.style && s.style !== 'custom');
    if (styleMini) styleMini.hidden = !showMini;
    if (showMini) {
      var href = '/design-presets/' + s.style + '/';
      var src = '/assets/img/styles/' + s.style + '.jpg';
      if (styleImg.getAttribute('src') !== src) {
        styleImg.setAttribute('src', src);
        styleImg.setAttribute('alt', st.label + ' — ' + st.blurb);
      }
      styleThumb.href = href;
      styleLink.href = href;
      if (styleDesc) styleDesc.textContent = st.blurb;
    }

    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
  }

  /* ---------- restore ---------- */
  function restore() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved) return;
    Object.keys(saved).forEach(function (k) {
      var v = saved[k];
      if (Array.isArray(v)) {
        Array.prototype.forEach.call(form.querySelectorAll('input[name="' + k + '"]'), function (i) {
          i.checked = v.indexOf(i.value) !== -1;
        });
      } else if (form.elements[k]) {
        var el = form.elements[k];
        if (el.length && el[0] && el[0].type === 'radio') {
          Array.prototype.forEach.call(el, function (i) { i.checked = i.value === v; });
        } else { el.value = v; }
      }
    });
  }

  /* ---------- tabs ---------- */
  Array.prototype.forEach.call(form.ownerDocument.querySelectorAll('#cgen .tabs button'), function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-tab');
      Array.prototype.forEach.call(form.ownerDocument.querySelectorAll('#cgen .tabs button'), function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      ['prompt', 'preview', 'spec'].forEach(function (t) {
        document.getElementById('cpanel-' + t).hidden = t !== tab;
      });
    });
  });

  /* ---------- actions ---------- */
  function say(msg) {
    statusEl.textContent = msg;
    setTimeout(function () { if (statusEl.textContent === msg) statusEl.textContent = ''; }, 4000);
  }
  document.getElementById('cCopy').addEventListener('click', function () {
    navigator.clipboard.writeText(lastPrompt).then(
      function () { say('Prompt copied. Paste it to your AI agent.'); },
      function () { say('Could not copy — select the text and copy it manually.'); }
    );
  });
  document.getElementById('cDownload').addEventListener('click', function () {
    var s = readState();
    var blob = new Blob([lastPrompt], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (slug(s.name) || 'site') + '-build-prompt.md';
    a.click();
    URL.revokeObjectURL(a.href);
    say('Downloaded.');
  });
  document.getElementById('cSpecDownload').addEventListener('click', function () {
    var s = readState();
    var blob = new Blob([JSON.stringify(toSpec(s), null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-spec.json';
    a.click();
    URL.revokeObjectURL(a.href);
    say('site-spec.json downloaded.');
  });

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  restore();
  render();
})();
