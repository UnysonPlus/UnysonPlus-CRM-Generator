/* Free CRM Website Generator: the shared engine.
   Each industry is a preset (src/presets/<id>.js) that calls CRMGEN.register({...}).
   The engine reads the form, builds site-spec.json and the build prompt, and renders the preview
   and the "before you build" checklist. Runs entirely in the browser; nothing is sent anywhere. */
(function () {
  'use strict';

  var SITE = 'https://crm.unysonplus.com';
  var SPEC_VERSION = '1.1';
  var KIT_URL = 'https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit';
  var PLUGIN_ZIP = 'https://github.com/UnysonPlus/UnysonPlus/releases/latest/download/unysonplus.zip';
  var THEME_REPO = 'https://github.com/UnysonPlus/UnysonPlus-Theme';

  var STYLES = {
    modern: 'Modern and clean: generous white space, a crisp sans-serif, large photos, minimal decoration.',
    classic: 'Classic and trusted: a refined serif for headings with a readable sans-serif body, structured layouts, calm colors.',
    luxury: 'Luxury: full-bleed photography, elegant display type, restrained color, lots of space, slow subtle motion.',
    friendly: 'Warm and friendly: rounded shapes, approachable type, real photos of people and places, inviting copy.'
  };
  var AGENTS = { 'claude-code': 'Claude Code', cursor: 'Cursor', codex: 'Codex', other: 'your coding agent' };

  var presets = {};
  window.CRMGEN = {
    register: function (p) { presets[p.id] = p; },
    presets: presets
  };

  /* ---------- helpers shared with presets ---------- */

  function lines(s) { return String(s || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  window.CRMGEN.util = { lines: lines, slug: slug, cap: cap };

  /* Content built from Post Types blueprints. Most presets describe their content with this:
     a primary blueprint (optionally relabeled), extra blueprints that come with it, extra fields,
     drafts to create, and an optional outside system the business already uses. */
  window.CRMGEN.blueprintContent = function (cfg) {
    var pr = cfg.primary;
    return {
      legend: cfg.legend,
      specKey: cfg.specKey,
      provider: cfg.provider || null,
      includedText: cfg.includedText,
      extrasLabel: cfg.extrasLabel,
      extras: cfg.extras,
      samples: cfg.samples,
      toSpec: function (s) {
        var extra = cfg.extras.filter(function (x) { return s.extras.indexOf(x.value) !== -1; });
        var out = {
          post_type: {
            blueprint: pr.blueprint,
            key: pr.key,
            labels: pr.rename ? { singular: pr.rename.singular, plural: pr.rename.plural } : null,
            archive_slug: pr.rename ? pr.rename.slug : pr.archive,
            base_fields: pr.baseFields,
            extra_fields: extra.filter(function (f) { return f.key; }).map(function (f) { return { label: f.label, key: f.key, type: f.type }; }),
            extra_taxonomies: extra.filter(function (f) { return f.taxonomy; }).map(function (f) { return { label: f.label, key: f.taxonomy, terms: f.terms }; }),
            drafts: parseInt(s.samples, 10) || 0
          },
          also_install: (cfg.secondary || []).filter(function (b) { return !b.extra || s.extras.indexOf(b.extra) !== -1; }).map(function (b) {
            return { blueprint: b.blueprint, purpose: b.purpose };
          })
        };
        if (cfg.provider) out[cfg.provider.specKey] = s.provider && s.provider !== 'none' ? s.provider : null;
        return out;
      },
      promptLines: function (S, s) {
        var pt = S.post_type;
        var out = [];
        out.push('Go to **Unyson+ → Post Types → Blueprints** and install **' + pr.title + '**. It creates the `' + pr.key + '` post type (archive at `/' + pr.archive + '/`) with a "' + pr.group + '" field group: ' + pr.baseText + '.');
        if (pr.rename) out.push('Then, in **Unyson+ → Post Types**, change its labels to "' + pr.rename.singular + '" / "' + pr.rename.plural + '" and its URL slug to `/' + pr.rename.slug + '/`. Keep the key `' + pr.key + '`. Check `docs/extensions/post-types.md` for where each setting lives.');
        if (pr.after) out.push(pr.after);
        if (pt.extra_fields.length) {
          out.push('Add these fields to the ' + pr.group + ' group with the Custom Fields extension:');
          pt.extra_fields.forEach(function (f) { out.push('- ' + f.label + ': key `' + f.key + '`, type `' + f.type + '`'); });
        }
        pt.extra_taxonomies.forEach(function (t) {
          out.push('Add a taxonomy **' + t.label + '** (`' + t.key + '`) on `' + pr.key + '` with the terms: ' + t.terms.join(', ') + '. It is a taxonomy, not a field, so visitors can filter by it.');
        });
        S.also_install.forEach(function (b) { out.push('Also install the **' + b.blueprint + '** blueprint: ' + b.purpose); });
        out.push('- **' + pr.listTitle + ' page:** ' + pr.listing + ' Check `docs/shortcodes/posts.md` for the exact options.');
        out.push('- **Single ' + pr.singleName + ' layout:** ' + pr.single + ' Look up in the kit how to build a reusable single-post layout from the dynamic post elements.');
        if (pt.drafts) out.push('- Draft ' + pt.drafts + ' ' + cfg.samples.noun + ' from what you know about the business, saved as drafts for me to review. Put "Draft" at the start of each title, keep claims general, and leave prices and specifics as [bracketed] placeholders.');
        else out.push('- Do not create ' + cfg.samples.noun + '; I will add my own.');
        if (cfg.provider) {
          var v = S[cfg.provider.specKey];
          if (v) out.push('- **' + cfg.provider.promptLabel + ' (' + v + '):** ' + cfg.provider.prompt);
        }
        return out;
      }
    };
  };

  function boot() {
    var root = document.querySelector('[data-preset]');
    if (!root) return;
    var P = presets[root.getAttribute('data-preset')];
    if (!P) return;

    var STORE_KEY = 'crmgen:v1:' + P.id;
    var form = document.getElementById('form');
    var promptOut = document.getElementById('promptOut');
    var specOut = document.getElementById('specOut');
    var previewOut = document.getElementById('previewOut');
    var checklist = document.getElementById('checklist');
    var meta = document.getElementById('meta');
    var status = document.getElementById('status');
    var copyBtn = document.getElementById('copy');
    var downloadBtn = document.getElementById('download');
    var shareBtn = document.getElementById('share');
    var providerField = document.getElementById('providerField');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role=tab]'));
    var activeTab = 'prompt';
    var touched = {};
    var C = P.content || null;

    /* ---------- read / write the form ---------- */

    function values(name) {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; });
    }
    function val(name) {
      var el = form.elements[name];
      return el && el.value != null ? String(el.value).trim() : '';
    }
    var SIMPLE = ['businessType', 'name', 'market', 'tagline', 'provider', 'samples', 'leadEmail', 'stages', 'primary', 'accent', 'style', 'logo', 'language', 'agent', 'wp']
      .concat((P.business.fields || []).map(function (f) { return f.name; }));
    var MULTI = ['audience', 'pages', 'forms', 'extras', 'emails'];

    function readState() {
      var s = { vertical: P.id, touched: touched };
      SIMPLE.forEach(function (k) { s[k] = val(k); });
      MULTI.forEach(function (k) { s[k] = values(k); });
      s.source = (form.querySelector('input[name="source"]:checked') || {}).value || (C && C.sources ? C.sources[0].value : '');
      return s;
    }

    function applyState(s) {
      if (!s) return;
      // State saved before presets existed used listing-specific names.
      if (s.listingSource && !s.source) s.source = s.listingSource;
      if (s.idxProvider && !s.provider) s.provider = s.idxProvider;
      if (s.extraFields && !s.extras) s.extras = s.extraFields;
      touched = s.touched || {};
      SIMPLE.forEach(function (k) { if (s[k] != null && form.elements[k]) form.elements[k].value = s[k]; });
      MULTI.forEach(function (k) {
        if (!Array.isArray(s[k])) return;
        form.querySelectorAll('input[name="' + k + '"]').forEach(function (i) { if (!i.disabled) i.checked = s[k].indexOf(i.value) !== -1; });
      });
      var radio = s.source && form.querySelector('input[name="source"][value="' + s.source + '"]');
      if (radio) radio.checked = true;
    }

    /* Pages and forms follow audience, business type and content source unless ticked by hand. */
    function syncPresets() {
      var aud = values('audience');
      var type = val('businessType');
      var src = (form.querySelector('input[name="source"]:checked') || {}).value || '';
      function wanted(item) {
        if (item.required) return true;
        if (item.source) return item.source.indexOf(src) !== -1;
        if (item.audience) return aud.indexOf(item.audience) !== -1;
        if (item.type) return item.type.indexOf(type) !== -1;
        return !!item.on;
      }
      P.pages.forEach(function (p) {
        var el = form.querySelector('input[name="pages"][value="' + p.id + '"]');
        if (!el) return;
        if (p.source) { el.checked = wanted(p); return; }
        if (!touched['pages:' + p.id]) el.checked = wanted(p);
      });
      P.forms.forEach(function (f) {
        var el = form.querySelector('input[name="forms"][value="' + f.id + '"]');
        if (el && !touched['forms:' + f.id]) el.checked = wanted(f);
      });
      if (providerField && C && C.provider) providerField.hidden = C.provider.when.indexOf(src) === -1;
    }

    /* ---------- spec ---------- */

    function missingItems(s) {
      var out = [];
      if (!s.name) out.push({ id: 'name', label: 'Business name', ask: 'my business name' });
      (P.business.fields || []).forEach(function (f) {
        if (f.required && !s[f.name]) out.push({ id: f.name, label: f.label, ask: f.ask || f.label.toLowerCase() });
      });
      if (!s.market) out.push({ id: 'market', label: P.business.marketLabel || 'Market or city', ask: P.business.marketAsk || 'the area I serve' });
      if (!s.leadEmail) out.push({ id: 'leadEmail', label: 'Email for new leads', ask: 'the email address new leads should go to' });
      if (P.missing) P.missing(s).forEach(function (m) { out.push(m); });
      return out;
    }

    function buildSpec(s) {
      var stages = lines(s.stages);
      if (!stages.length) stages = P.stages.slice();
      var name = s.name || '[Business name]';
      var business = {
        name: name,
        type: s.businessType,
        market: s.market || '[' + (P.business.marketLabel || 'Market or city') + ']',
        tagline: s.tagline || null
      };
      if (P.business.toSpec) {
        var extra = P.business.toSpec(s, name);
        for (var k in extra) business[k] = extra[k];
      }
      business.audience = s.audience;
      business.language = s.language || 'English';

      var spec = {
        spec_version: SPEC_VERSION,
        generator: SITE + P.path,
        vertical: P.id,
        business: business,
        pages: P.pages.filter(function (p) { return s.pages.indexOf(p.id) !== -1 || p.required; }).map(function (p) {
          return { slug: p.id === 'home' ? '' : slug(p.title), title: p.title, purpose: p.purpose };
        })
      };
      if (C) spec[C.specKey] = C.toSpec(s);
      spec.lead_capture = {
        notify_email: s.leadEmail || '[ask the owner]',
        forms: P.forms.filter(function (f) { return s.forms.indexOf(f.id) !== -1 || f.required; }).map(function (f) {
          return { id: f.id, title: f.title, starter: f.starter, fields: f.fields, placement: f.where, actions: ['store_entry', 'subscribe_with_consent'] };
        })
      };
      spec.crm = {
        engine: 'newsletter-crm',
        pipeline: { method: 'tags', tag_prefix: 'Stage: ', stages: stages, saved_segment_per_stage: true },
        lists: s.audience.map(function (a) {
          var o = (P.audience.options || []).filter(function (x) { return x.value === a; })[0];
          return o && o.list ? o.list : cap(a);
        }),
        double_opt_in: true,
        emails: s.emails.map(function (e) {
          var o = P.emails.filter(function (x) { return x.value === e; })[0];
          return { id: e, description: o ? o.description : e };
        })
      };
      spec.brand = {
        primary: s.primary,
        accent: s.accent,
        style: s.style,
        style_notes: (P.styles && P.styles[s.style]) || STYLES[s.style],
        logo: s.logo === 'have' ? 'owner will supply a logo file' : 'text logo from the business name'
      };
      spec.seo = P.seo.toSpec(s);
      spec.compliance = P.compliance.toSpec(s);
      spec.build = {
        agent: s.agent,
        wordpress: s.wp,
        ai_dev_kit: KIT_URL,
        plugin: PLUGIN_ZIP,
        parent_theme: THEME_REPO,
        extensions: P.extensions
      };
      spec.missing = missingItems(s).map(function (m) { return m.id; });
      return spec;
    }

    /* ---------- prompt ---------- */

    function buildPrompt(spec, s) {
      var b = spec.business;
      var out = [];
      function p() { out.push(Array.prototype.join.call(arguments, '')); }
      var typeOpt = P.business.types.filter(function (t) { return t.value === b.type; })[0];
      var missing = missingItems(s);

      p('# ', P.prompt.title(b));
      p('');
      p('You are building ', P.prompt.intro, ' with a built-in CRM on WordPress, using the free Unyson+ framework. Everything I chose is in the site spec at the end of this prompt. Save it as `site-spec.json` in the project folder and treat it as the source of truth; this prompt explains the order of work and the rules.');
      p('');
      p('## About the business');
      p('- Name: ', b.name, ' (', typeOpt ? typeOpt.promptLabel : b.type, ')');
      P.prompt.aboutLines(b, s).forEach(function (l) { p(l); });
      var served = b.audience.map(function (v) {
        var o = P.audience.options.filter(function (x) { return x.value === v; })[0];
        return o ? o.label.toLowerCase() : v;
      });
      p('- Serves: ', served.length ? served.join(', ') : P.audience.fallback);
      p('- Site language: ', b.language);
      p('');

      p('## Step 0: Setup');
      if (s.wp === 'local') p('WordPress is installed on this computer. Find its folder and admin URL, or ask me if you cannot.');
      else if (s.wp === 'host') p('WordPress is on my web host. Ask me how you can reach it (SSH with WP-CLI is best). Never write passwords or keys into project files.');
      else p('WordPress is not installed yet. Help me set up a local WordPress install first, then continue. Use a fresh install with no other page builder.');
      if (missing.length) p('Before you start, ask me for: ', missing.map(function (m) { return m.ask; }).join('; '), '. Use them wherever the spec has a [bracketed] placeholder.');
      p('1. Get the AI Dev Kit: clone ', KIT_URL, '. Read `AGENTS.md` first, then `docs/site-build-protocol.md`. This is a **fresh build** (there is no source site to copy), so follow the fresh-build path. Before using any element, extension or option, look it up in the kit\'s `docs/` folder instead of guessing.');
      p('2. Install the Unyson+ plugin from ', PLUGIN_ZIP, ' and the parent theme from ', THEME_REPO, ' (latest release; the theme folder must be named `unysonplus-theme`). Create a child theme for this site from the kit\'s child-theme starter and activate it.');
      p('3. In **Unyson+ → Extensions**, enable: ', P.prompt.extensionsText, '. Install any that are missing through the Extensions manager.');
      p('');

      p('## Step 1: Design system first');
      p('Set **Theme Settings** before building any page: colors, typography, buttons, spacing and the header and footer. Build every page from these settings so the site stays consistent.');
      p('- Primary color: ', spec.brand.primary, '; accent color: ', spec.brand.accent, ' (use the accent for main calls to action). Derive the remaining shades from these two and check text contrast meets WCAG AA.');
      p('- Style: ', spec.brand.style_notes);
      p('- Logo: ', s.logo === 'have' ? 'ask me for my logo file.' : 'set the business name as a text logo.');
      p('');

      if (C) {
        p('## Step 2: ', C.legend);
        C.promptLines(spec[C.specKey], s).forEach(function (l) { p(l); });
        p('');
      }

      p('## Step ', C ? 3 : 2, ': Pages');
      spec.pages.forEach(function (pg) { p('- **', pg.title, '** (`/', pg.slug, pg.slug ? '/' : '', '`): ', pg.purpose); });
      p('Add every page to the main menu in a sensible order, with Contact last as a button. Each page ends with a clear call to action leading to a lead form.');
      p('');

      var n = C ? 4 : 3;
      p('## Step ', n, ': Lead capture');
      p('Build each form with the Forms extension, starting from the named starter form where one fits. On every form keep the **Store entry** action on, send notifications to ', spec.lead_capture.notify_email, ', and add an optional **Consent** field (purpose: newsletter) with the **Subscribe to the newsletter** action, so only people who agree are added to email lists.');
      spec.lead_capture.forms.forEach(function (f) {
        p('- **', f.title, '** (starter: ', f.starter, '). Fields: ', f.fields.join(', '), '. Place on: ', f.placement, '.');
      });
      p('');

      p('## Step ', n + 1, ': CRM');
      p('Use the **Newsletter CRM** extension as the CRM. Do not build custom CRM tables or a custom CRM plugin.');
      if (spec.crm.lists.length) p('- Create lists: ', spec.crm.lists.join(', '), '. Each form adds its leads to the matching list.');
      p('- Pipeline: create one tag per stage, named with the prefix "Stage: ": ', spec.crm.pipeline.stages.map(function (x) { return '"Stage: ' + x + '"'; }).join(', '), '. New leads start in "Stage: ', spec.crm.pipeline.stages[0], '". Save one segment per stage so I can open each stage in one click, and show me how to move a lead to the next stage by changing its tag.');
      p('- Keep double opt-in on.');
      if (spec.crm.emails.length) {
        p('- Emails (write them in my voice, save campaigns as drafts, and do not send anything):');
        spec.crm.emails.forEach(function (e) { p('  - ', e.description); });
      }
      p('');

      p('## Step ', n + 2, ': SEO, accessibility and compliance');
      p('- ', P.seo.promptLine(spec));
      p('- Meet WCAG 2.2 AA: real headings in order, alt text on every image, labeled form fields, visible focus and enough contrast.');
      p('- Keep pages fast: compressed images, lazy loading below the fold, and the Asset Optimizer if it helps.');
      p('- ', P.compliance.footerLine(b));
      (P.compliance.extraLines ? P.compliance.extraLines(s) : []).forEach(function (l) { p('- ', l); });
      p('');

      p('## Step ', n + 3, ': Check everything and report back');
      p('Open every page at desktop and phone width and fix anything broken or misaligned. Submit each form once and confirm the entry appears under **Unyson+ → Form Entries**, and that a test lead who ticks the consent box appears in Newsletter CRM with the first stage tag. Then delete the test entries.');
      p('Finish with a short report: what you built, what still needs me (', P.prompt.needs(s), '), and how I edit ', P.prompt.editWhat, ' in wp-admin.');
      p('');

      p('## Rules');
      p('- Never invent facts about the business: no made-up awards, sales numbers, years in business, reviews or team members. Use clearly marked placeholders such as [', P.prompt.placeholderExample, '] instead.');
      p('- Use Unyson+ features before adding any plugin. ', P.prompt.pluginRule);
      (P.prompt.rules || []).forEach(function (r) { p('- ', r); });
      p('- Ask before deleting or overwriting anything you did not create.');
      p('- If the kit\'s docs and this prompt disagree about how a feature works, the docs win; tell me what you changed.');
      p('');

      p('## Site spec');
      p('```json');
      p(JSON.stringify(spec, null, 2));
      p('```');
      return out.join('\n');
    }

    /* ---------- preview ---------- */

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function renderPreview(spec) {
      var frag = document.createDocumentFragment();
      var wrap = el('div', 'pv');
      wrap.style.setProperty('--pv-primary', spec.brand.primary);
      wrap.style.setProperty('--pv-accent', spec.brand.accent);

      var site = el('div', 'pv-site');
      site.setAttribute('aria-hidden', 'true');
      var bar = el('div', 'pv-bar');
      bar.appendChild(el('span', 'pv-logo', spec.business.name));
      var nav = el('span', 'pv-nav');
      spec.pages.filter(function (pg) { return pg.slug && pg.slug !== 'privacy-policy' && pg.slug !== 'contact'; }).slice(0, 5).forEach(function (pg) { nav.appendChild(el('span', null, pg.title)); });
      bar.appendChild(nav);
      bar.appendChild(el('span', 'pv-btn', 'Contact'));
      site.appendChild(bar);
      var hero = el('div', 'pv-hero');
      hero.appendChild(el('span', 'pv-h', spec.business.tagline || spec.business.name));
      hero.appendChild(el('span', 'pv-sub', spec.business.market));
      hero.appendChild(el('span', 'pv-cta', spec.lead_capture.forms[1] ? spec.lead_capture.forms[1].title : 'Get in touch'));
      site.appendChild(hero);
      var cards = el('div', 'pv-cards');
      for (var i = 0; i < 3; i++) cards.appendChild(el('span', 'pv-card'));
      site.appendChild(cards);
      wrap.appendChild(site);

      wrap.appendChild(el('h3', 'pv-title', 'Pages (' + spec.pages.length + ')'));
      var pages = el('ul', 'pv-pages');
      spec.pages.forEach(function (pg) {
        var li = el('li');
        li.appendChild(el('b', null, pg.title));
        li.appendChild(el('code', null, '/' + pg.slug + (pg.slug ? '/' : '')));
        pages.appendChild(li);
      });
      wrap.appendChild(pages);

      wrap.appendChild(el('h3', 'pv-title', 'Lead forms (' + spec.lead_capture.forms.length + ')'));
      var forms = el('ul', 'pv-forms');
      spec.lead_capture.forms.forEach(function (f) {
        var li = el('li');
        li.appendChild(el('b', null, f.title));
        li.appendChild(el('span', null, f.fields.length + ' fields · ' + f.placement));
        forms.appendChild(li);
      });
      wrap.appendChild(forms);

      wrap.appendChild(el('h3', 'pv-title', 'Pipeline (' + spec.crm.pipeline.stages.length + ' stages)'));
      var pipe = el('ol', 'pv-pipe');
      spec.crm.pipeline.stages.forEach(function (st) { pipe.appendChild(el('li', null, st)); });
      wrap.appendChild(pipe);

      frag.appendChild(wrap);
      previewOut.textContent = '';
      previewOut.appendChild(frag);
    }

    /* ---------- checklist ---------- */

    function renderChecklist(s) {
      var miss = missingItems(s).map(function (m) { return m.id; });
      var items = [
        { label: 'Business name', done: miss.indexOf('name') === -1 }
      ];
      (P.business.fields || []).forEach(function (f) { if (f.required) items.push({ label: f.label, done: miss.indexOf(f.name) === -1 }); });
      items.push({ label: P.business.marketLabel || 'Market or city', done: miss.indexOf('market') === -1 });
      items.push({ label: 'Email for new leads', done: miss.indexOf('leadEmail') === -1 });
      if (s.logo === 'have') items.push({ label: 'Your logo file, ready to hand to the agent', prep: true });
      (P.prepare ? P.prepare(s) : []).forEach(function (x) { items.push({ label: x, prep: true }); });
      checklist.textContent = '';
      items.forEach(function (it) {
        var li = el('li', it.done ? 'is-done' : it.prep ? 'is-prep' : 'is-missing');
        li.appendChild(el('span', 'ck-state', it.done ? 'Done' : it.prep ? 'Have ready' : 'Missing'));
        li.appendChild(el('span', 'ck-label', it.label));
        checklist.appendChild(li);
      });
    }

    /* ---------- render ---------- */

    var lastPrompt = '';
    var lastSpec = '';
    var saveTimer;

    function render(flash) {
      syncPresets();
      var s = readState();
      var spec = buildSpec(s);
      lastSpec = JSON.stringify(spec, null, 2);
      lastPrompt = buildPrompt(spec, s);
      promptOut.textContent = lastPrompt;
      specOut.textContent = lastSpec;
      renderPreview(spec);
      renderChecklist(s);
      meta.textContent = lastPrompt.split(/\s+/).length.toLocaleString() + ' words · paste into ' + AGENTS[s.agent];
      if (flash) {
        var pre = document.querySelector('.out__panel:not([hidden]) > *');
        if (pre) { pre.classList.remove('flash'); void pre.offsetWidth; pre.classList.add('flash'); }
      }
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable */ }
      }, 250);
    }

    function say(msg) {
      status.textContent = msg;
      clearTimeout(say.t);
      say.t = setTimeout(function () { status.textContent = ''; }, 3500);
    }

    function copyText(text, okMsg) {
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        say(ok ? okMsg : 'Copy failed. Select the text and copy it by hand.');
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { say(okMsg); }, fallback);
      else fallback();
    }

    function download(filename, text, type) {
      var url = URL.createObjectURL(new Blob([text], { type: type }));
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function setTab(which) {
      activeTab = which;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === which;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      copyBtn.textContent = which === 'spec' ? 'Copy spec' : 'Copy prompt';
      downloadBtn.textContent = which === 'spec' ? 'Download site-spec.json' : 'Download prompt';
    }

    function encodeState(s) {
      return btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function decodeState(str) {
      try { return JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))); }
      catch (e) { return null; }
    }

    /* ---------- events ---------- */

    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'vertical') {
        var next = presets[t.value] || null;
        var path = next ? next.path : t.selectedOptions[0] && t.selectedOptions[0].getAttribute('data-path');
        if (path) { location.href = path; return; }
      }
      if ((t.name === 'pages' || t.name === 'forms') && t.type === 'checkbox') touched[t.name + ':' + t.value] = true;
      render(true);
    });
    form.addEventListener('input', function (e) {
      if (e.target.type !== 'checkbox' && e.target.type !== 'radio' && e.target.tagName !== 'SELECT') render(false);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); next.click();
      });
    });

    copyBtn.addEventListener('click', function () {
      if (activeTab === 'spec') copyText(lastSpec, 'site-spec.json copied.');
      else copyText(lastPrompt, 'Prompt copied. Paste it into ' + AGENTS[val('agent')] + '.');
    });
    downloadBtn.addEventListener('click', function () {
      if (activeTab === 'spec') { download('site-spec.json', lastSpec, 'application/json'); say('site-spec.json downloaded.'); }
      else { download((slug(val('name')) || 'crm-site') + '-build-prompt.md', lastPrompt, 'text/markdown'); say('Prompt downloaded. The spec is included at the end.'); }
    });
    shareBtn.addEventListener('click', function () {
      copyText(location.origin + location.pathname + '#s=' + encodeState(readState()), 'Share link copied. Anyone opening it sees these choices.');
    });

    document.getElementById('reset').addEventListener('click', function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
      if (location.hash.indexOf('#s=') === 0) history.replaceState(null, '', location.pathname + location.search);
      form.reset();
      touched = {};
      form.elements.stages.value = P.stages.join('\n');
      render(true);
      say('Reset to the ' + P.label.toLowerCase() + ' defaults.');
    });

    /* ---------- boot ---------- */

    form.elements.stages.value = P.stages.join('\n');
    var initial = null;
    if (location.hash.indexOf('#s=') === 0) {
      initial = decodeState(location.hash.slice(3));
      // A link made for another industry opens on that industry's page.
      if (initial && initial.vertical && initial.vertical !== P.id) {
        var target = (window.CRMGEN_PATHS || {})[initial.vertical];
        if (target) { location.replace(target + location.hash); return; }
        initial = null;
      }
    }
    if (!initial) {
      try {
        initial = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (!initial && P.legacyStoreKey) initial = JSON.parse(localStorage.getItem(P.legacyStoreKey) || 'null');
      } catch (e) { initial = null; }
    }
    applyState(initial);
    setTab('prompt');
    render(false);
  }

  // Deferred preset scripts run after this one but before DOMContentLoaded, so wait for it.
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
