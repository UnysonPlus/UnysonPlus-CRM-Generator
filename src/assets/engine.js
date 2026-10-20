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
  /* The Claude-app track builds through the plugin's MCP connector, which needs these versions. */
  var MIN_PLUGIN = '3.0.47';
  var SETUP_PAGE = 'Unyson+ → Connect AI';
  var LOCAL_TOOLS = {
    local: 'Local: open the site in Local and use its "Open site shell" to run WP-CLI; the site files are in the folder Local shows for the site.',
    studio: 'WordPress Studio: find the site folder Studio created and how it runs WP-CLI; ask me if you cannot.',
    xampp: 'XAMPP / WAMP / MAMP: the site is a folder under the web server root (htdocs or www). Install WP-CLI if it is missing.',
    other: 'Find the site folder and how to run WP-CLI there; ask me if you cannot.'
  };

  /* Extensions in the order they must be activated (Forms before the CRM, which needs it), with the
     names the Extensions manager shows. Page Builder and Theme Builder are needed by every build. */
  var EXT_ORDER = ['page-builder', 'forms', 'post-types', 'custom-fields', 'crm', 'seo', 'theme-builder'];
  var EXT_NAMES = {
    'page-builder': 'Page Builder (it brings Shortcodes, Builder and Mailer)',
    forms: 'Forms', 'post-types': 'Post Types & Taxonomies', 'custom-fields': 'Custom Fields',
    'crm': 'CRM', seo: 'SEO', 'theme-builder': 'Theme Builder'
  };

  /* WCAG contrast ratio between two hex colours. */
  function contrast(a, b) {
    function lum(hex) {
      var m = String(hex).replace('#', '').match(/.{2}/g);
      if (!m || m.length < 3) return 0;
      var c = m.slice(0, 3).map(function (x) {
        var v = parseInt(x, 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  var presets = {};
  window.CRMGEN = {
    register: function (p) { presets[p.id] = p; },
    presets: presets
  };

  /* ---------- helpers shared with presets ---------- */

  function lines(s) { return String(s || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* Notes every content step needs. Each one answers a question a test build had to guess at. */
  var POSTS_NOTE = 'The `posts` element shows the featured image, title, excerpt and a link, but not custom fields, so put a one-line summary of each item (with its price, if it has one) in its Excerpt; the other fields appear on the single page. Check `docs/shortcodes/posts.md` for the exact options.';
  var TEAM_NOTE = 'Never invent people: create placeholder profiles titled [Name] with [bracketed] details until I send real ones. The photo is the featured image; add any extra fields the profile needs to its Profile group with Custom Fields.';
  function singleLayoutNote(key, exampleField) {
    return 'Build this layout once with the **Theme Builder** extension: a Body part, plus a Template whose condition is all `' + key + '` posts. Show single-value custom fields (text, numbers, prices) with Dynamic Content tokens such as `{{post_meta|key=' + exampleField + '}}`; the Post Meta element cannot read Custom Fields values. Gallery, list and measurement fields need a small shortcode in the child theme.';
  }
  window.CRMGEN.util = { lines: lines, slug: slug, cap: cap, POSTS_NOTE: POSTS_NOTE, TEAM_NOTE: TEAM_NOTE, singleLayoutNote: singleLayoutNote };

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
        var urlSlug = pr.rename ? pr.rename.slug : pr.archive;
        out.push('Go to **Unyson+ → Post Types → Blueprints** and install **' + pr.title + '**. It creates the `' + pr.key + '` post type with a "' + pr.group + '" field group: ' + pr.baseText + '.');
        out.push('Then edit the post type in **Unyson+ → Post Types**: ' + (pr.rename ? 'change its labels to "' + pr.rename.singular + '" / "' + pr.rename.plural + '", ' : '') + 'set its URL slug to `' + urlSlug + '` and turn **Has archive** off, because the ' + pr.listTitle + ' page is the listing. Single items then live at `/' + urlSlug + '/<name>/`. Keep the key `' + pr.key + '`. Check `docs/extensions/post-types.md` for where each setting lives.');
        if (pr.after) out.push(pr.after);
        if (pt.extra_fields.length) {
          out.push('Add these fields to the ' + pr.group + ' group with the Custom Fields extension:');
          pt.extra_fields.forEach(function (f) { out.push('- ' + f.label + ': key `' + f.key + '`, type `' + f.type + '`' + (f.type === 'list' ? ' (one row per question, written "Question — Answer")' : '')); });
        }
        pt.extra_taxonomies.forEach(function (t) {
          out.push('In **Unyson+ → Post Types → Add Taxonomy**, add **' + t.label + '** (`' + t.key + '`) on `' + pr.key + '`, then add its terms: ' + t.terms.join(', ') + '. It is a taxonomy, not a field, so visitors can filter by it.');
        });
        S.also_install.forEach(function (b) { out.push('Also install the **' + b.blueprint + '** blueprint: ' + b.purpose + (b.blueprint === 'Team Members' ? ' ' + TEAM_NOTE : '')); });
        out.push('- **' + pr.listTitle + ' page:** ' + pr.listing + ' ' + POSTS_NOTE);
        out.push('- **Single ' + pr.singleName + ' layout:** ' + pr.single + ' ' + singleLayoutNote(pr.key, pr.baseFields[0]));
        if (pt.drafts) out.push('- Draft ' + pt.drafts + ' ' + cfg.samples.noun + ' from what you know about the business, saved as drafts for me to review. Give them plain titles and slugs (the draft status already marks them; no "Draft" prefix), keep claims general, and leave prices and specifics as [bracketed] placeholders. Drafts do not appear on the site, so the ' + pr.listTitle + ' page shows its empty state until I publish them: say so in your report.');
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
    var SIMPLE = ['businessType', 'name', 'market', 'tagline', 'bizEmail', 'hours', 'provider', 'samples', 'leadEmail', 'stages', 'primary', 'accent', 'style', 'logo', 'language', 'track', 'agent', 'wp', 'access', 'localtool']
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
      // Saved before the Claude-app track existed: those people chose a coding agent.
      if (!s.track && s.agent) s.track = 'agent';
      if (s.wp === 'none') s.wp = 'host';
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
      syncSetup();
    }

    /* Build setup: show the questions that matter for the chosen track. */
    function syncSetup() {
      var app = val('track') !== 'agent';
      var host = val('wp') === 'host';
      document.getElementById('agentRow').hidden = app;
      document.getElementById('accessField').hidden = app || !host;
      document.getElementById('localField').hidden = app || (host && val('access') !== 'migrate');
      document.getElementById('resume').hidden = !app;
      document.getElementById('trackNote').textContent = app && !host
        ? 'The Claude app can only reach a site with a public HTTPS address, so build on your web host (a staging copy is ideal). Building on your computer needs a coding agent.'
        : '';
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
        tagline: s.tagline || null,
        email: s.bizEmail || null,
        opening_hours: s.hours || null
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
      var lists = s.audience.map(function (a) {
        var o = (P.audience.options || []).filter(function (x) { return x.value === a; })[0];
        return o && o.list ? o.list : cap(a);
      });
      var firstTag = 'stage-' + slug(stages[0]);
      spec.lead_capture = {
        notify_email: s.leadEmail || '[ask the owner]',
        forms: P.forms.filter(function (f) { return s.forms.indexOf(f.id) !== -1 || f.required; }).map(function (f) {
          // The single optional opt-in box is added to every form, so drop per-form duplicates of it.
          var fields = f.fields.filter(function (x) { return !/^Consent to receive/i.test(x); });
          // The subscribe action needs an email address.
          if (!fields.some(function (x) { return /email/i.test(x); })) fields = fields.concat(['Email (optional; needed for the newsletter opt-in)']);
          return {
            id: f.id, title: f.title,
            starter: f.starter === 'Newsletter signup' ? 'Newsletter signup' : (f.starter === 'Booking / Appointment' ? 'Appointment request' : 'Contact'),
            fields: fields, placement: f.where,
            subscribe_list: f.list && lists.indexOf(f.list) !== -1 ? f.list : (lists[0] || null),
            subscribe_tag: firstTag,
            actions: ['store_entry', 'subscribe_with_consent']
          };
        })
      };
      spec.crm = {
        engine: 'crm',
        pipeline: { method: 'tags', tag_prefix: 'Stage: ', stages: stages, tag_slugs: stages.map(function (x) { return 'stage-' + slug(x); }), saved_segment_per_stage: true },
        lists: lists,
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
      var appTrack = s.track !== 'agent';
      spec.build = {
        track: appTrack ? 'claude-app' : 'coding-agent',
        agent: appTrack ? null : s.agent,
        wordpress: s.wp,
        host_access: !appTrack && s.wp === 'host' ? s.access : null,
        local_tool: !appTrack && (s.wp === 'local' || s.access === 'migrate') ? s.localtool : null,
        connector: appTrack ? { min_plugin: MIN_PLUGIN, setup_page: SETUP_PAGE } : null,
        ai_dev_kit: KIT_URL,
        plugin: PLUGIN_ZIP,
        parent_theme: THEME_REPO,
        extensions: EXT_ORDER.filter(function (e) { return e === 'page-builder' || e === 'theme-builder' || P.extensions.indexOf(e) !== -1; })
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
      p('You are building ', P.prompt.intro, ' with a built-in CRM on WordPress, using the free Unyson+ framework. Everything I chose is in the site spec at the end of this prompt. Save it as `site-spec.json` in the child theme folder and treat it as the source of truth; this prompt explains the order of work and the rules.');
      p('');
      p('## About the business');
      p('- Name: ', b.name, ' (', typeOpt ? typeOpt.promptLabel : b.type, ')');
      P.prompt.aboutLines(b, s).forEach(function (l) { p(l); });
      if (b.email) p('- Public email: ', b.email);
      if (b.opening_hours) p('- Opening hours: ', b.opening_hours);
      var served = b.audience.map(function (v) {
        var o = P.audience.options.filter(function (x) { return x.value === v; })[0];
        return o ? o.label.toLowerCase() : v;
      });
      p('- Serves: ', served.length ? served.join(', ') : P.audience.fallback);
      p('- Site language: ', b.language);
      p('');

      var app = s.track !== 'agent';
      var exts = spec.build.extensions.map(function (e) { return EXT_NAMES[e]; }).join(', ');

      if (app) {
        p('## How you work on this site');
        p('You are working through the **Unyson+ connector**: every change goes through its tools (site_info, build_docs, create_page, insert_items, apply_template, update_theme_settings, forms_add, crm_save_lists and the rest). You cannot run commands or edit files. Where this prompt names a wp-admin screen, use the matching tool; if no tool covers it, ask me to do it and tell me exactly what to click. Where it says `docs/<file>`, read that file with build_docs.');
        p('Work in **stages**, one stage per reply: Step 0, then each step below. End every stage with a short summary of what you did and what comes next, and wait for me to say "continue". If we get interrupted I will paste a short resume message; then check the site with the tools and carry on from where it actually stands.');
        p('You cannot see the pages. After each page, check it with render_check, give me its link, and ask me to look at it on a computer and a phone and tell you anything that looks wrong.');
        p('');
        p('## Step 0: Check the site');
        if (missing.length) p('Before you start, ask me for: ', missing.map(function (m) { return m.ask; }).join('; '), '. Use them wherever the spec has a [bracketed] placeholder.');
        p('1. Call site_info. This build needs Unyson+ ', MIN_PLUGIN, ' or newer with these extensions active: ', exts, '. If Unyson+ is older, stop and ask me to update it. If an extension is missing, install it with manage_extension (it asks me first). If permalinks are "plain", ask me to open **', SETUP_PAGE, '** and run the setup again.');
        p('2. Call build_docs with no path and read the fresh-build docs it lists. Read the doc for each element, extension and Theme Settings tab before you use it.');
        p('3. Set the email sender with mailer_sender: the business name as the From name, and ', b.email ? b.email : 'the email for new leads', ' as the From address. Sending works through WordPress mail; on a live site I will set up SMTP myself on the Mailer screen. Never ask me for an email or hosting password.');
        p('4. WordPress already has a draft Privacy Policy page: reuse it. Ask me to delete the default "Sample Page" and "Hello world!" post (there is no tool for deleting pages).');
        if (s.logo === 'have') p('5. Ask me to upload my logo to the Media Library, then find it with list_media.');
        p('');
      } else {
        p('## Step 0: Setup');
        if (s.wp === 'local') p('WordPress is installed on this computer. ', LOCAL_TOOLS[s.localtool] || LOCAL_TOOLS.other);
        else if (s.access === 'migrate') p('My site is on my web host, but build on a fresh WordPress on this computer first (', LOCAL_TOOLS[s.localtool] || LOCAL_TOOLS.other, ') and move it to my host in the last step.');
        else if (s.access === 'ssh') p('WordPress is on my web host and you work over SSH with WP-CLI. Ask me for the SSH host and username, and help me add an SSH key for you. Never ask for or store a password, and never write keys or credentials into project files. Ask me to take a backup with my host\'s backup tool before you change anything.');
        else p('WordPress is on my web host and you only have the WordPress admin. Ask me to create a temporary administrator named "ai-builder" and an Application Password for it (Users → Profile → Application Passwords), and use the REST API and the Unyson+ connector with it. Never ask for my own password, never write the Application Password into files, and remind me at the end to revoke it and delete the user. Where a step needs files (uploading a theme or plugin), tell me exactly what to upload in wp-admin. Ask me to take a backup with my host\'s backup tool first.');
        if (missing.length) p('Before you start, ask me for: ', missing.map(function (m) { return m.ask; }).join('; '), '. Use them wherever the spec has a [bracketed] placeholder.');
        p('1. Get the AI Dev Kit: clone ', KIT_URL, '. Read `AGENTS.md` first, then `docs/build-reference.md` (Part 2, "Fresh builds") and `docs/building-pages.md`. This is a **fresh build**: there is no source site, so skip the capture and conversion steps elsewhere in the kit. Look up every element, extension and option in the kit\'s `docs/` folder before using it.');
        p('2. Set **Settings → Permalinks** to "Post name". Unyson+ does not need the Classic Editor plugin, so do not install it.');
        p('3. Install the Unyson+ plugin from ', PLUGIN_ZIP, '. It contains only the core; the features this site needs come from the Extensions manager in step 5.');
        p('4. Install the parent theme: from ', THEME_REPO, '/releases/latest download the source zip and rename the extracted folder to `unysonplus-theme`. Copy the kit\'s `samples/sample-child-theme` as this site\'s child theme, rename it for the business, and activate it.');
        p('5. In **Unyson+ → Extensions**, download and then activate, in this order: ', exts, '. Some are under "Show other extensions". Forms must be active before CRM.');
        p('6. Email: forms send through WordPress mail out of the box. In **Mailer** settings set a From name and address (and SMTP on a live host, where plain WordPress mail often lands in spam), then send a test email.');
        p('7. WordPress already has a draft Privacy Policy page at `/privacy-policy/`: reuse it for the privacy policy. Delete the default "Sample Page" and "Hello world!" post.');
        p('');
      }

      var white = contrast('#ffffff', spec.brand.accent);
      p('## Step 1: Design system first');
      p('Set **Theme Settings** before building any page: colors, typography, buttons, spacing and the header and footer. Build every page from these settings so the site stays consistent.');
      p('- Primary color: ', spec.brand.primary, '; accent color: ', spec.brand.accent, ' (use the accent for main calls to action). Derive the remaining shades from these two and check text contrast meets WCAG AA.', white < 4.5 ? ' White text on this accent is only ' + white.toFixed(2) + ':1, so give accent buttons dark text.' : '');
      p('- Style: ', spec.brand.style_notes);
      p('- Logo: ', s.logo === 'have' ? 'ask me for my logo file.' : 'set the business name as a text logo.');
      p('- Header: put Contact in the header as its CTA Button element (button styles take a `btn-` value such as `btn-accent`), not as a menu item. Keep the main menu to 7 items or fewer: nest the rest under a parent item, and put legal pages in the footer menu.');
      p('- Footer: on a dark footer background the headings turn white automatically; set Footer Layout → Heading Color only if they need a different colour.');
      if (app) p('- Use update_theme_settings (describe_theme_settings first) and save_preset for button and box styles; never style single elements by hand.');
      p('');

      if (C) {
        p('## Step 2: ', C.legend);
        C.promptLines(spec[C.specKey], s).forEach(function (l) { p(l); });
        p('');
      }

      p('## Step ', C ? 3 : 2, ': Pages');
      spec.pages.forEach(function (pg) { p('- **', pg.title, '** (`/', pg.slug, pg.slug ? '/' : '', '`): ', pg.purpose); });
      p('Each page ends with a clear call to action leading to a lead form.');
      p('');

      var n = C ? 4 : 3;
      p('## Step ', n, ': Lead capture');
      p('Build each form with the Forms extension\'s contact form element. Start from the starter named for each form (**Contact**, **Appointment request** or **Newsletter signup**) and make the fields exactly match the list below: remove every other field the starter brings, but keep its required privacy agreement box. Do not use the Table booking (restaurant) or Quote starters; they carry restaurant and survey fields. On every form:');
      if (app) {
        p('- place it with forms_add: email_to ', spec.lead_capture.notify_email, ', store true, and subscribe { list: the list slug below, tags: ["Stage: ', spec.crm.pipeline.stages[0], '"], name_field: "Name" };');
        p('- include one optional **consent** field (type consent, purpose newsletter): only people who tick it join the CRM. Create the CRM lists and stage tags (the CRM step) before the forms, because a form can only subscribe people to a list that exists.');
      } else {
        p('- keep the **Store entry** action on and send notifications to ', spec.lead_capture.notify_email, ';');
        p('- add one optional **Consent** field (purpose: newsletter) and the **Subscribe to the newsletter** action, set to the list named below. In its Tags box enter the first stage tag, "Stage: ', spec.crm.pipeline.stages[0], '".');
      }
      p('Forms are elements placed on pages. Where a placement says footer or header button, put a button there that links to the form on its page; the footer cannot hold a form.');
      spec.lead_capture.forms.forEach(function (f) {
        p('- **', f.title, '** (starter: ', f.starter, '). Fields: ', f.fields.join(', '), '. Place on: ', f.placement, '.', f.subscribe_list ? ' Subscribe list: ' + f.subscribe_list + '.' : '');
      });
      p('Only people who tick the consent box reach the CRM; every other enquiry is kept in **Unyson+ → Form Entries**. Say this plainly in your report.');
      p('');

      p('## Step ', n + 1, ': CRM');
      p('Use the **CRM** extension. Do not build custom CRM tables or a custom CRM plugin.');
      if (app) p('Tools: crm_save_lists (lists and stage tags in one call), crm_save_segment (one per stage: the stage tag and status subscribed), crm_settings (double opt-in and the welcome email), crm_save_campaign (drafts only), and crm_describe to check the result.');
      if (spec.crm.lists.length) p('- Create lists: ', spec.crm.lists.join(', '), '.');
      p('- Pipeline: under **CRM → Lists, Tags & Segments**, create one tag per stage: ', spec.crm.pipeline.stages.map(function (x, i) { return '"Stage: ' + x + '" (`' + spec.crm.pipeline.tag_slugs[i] + '`)'; }).join(', '), '. New leads start in "Stage: ', spec.crm.pipeline.stages[0], '". Save one segment per stage so I can open each stage in one click. To move a lead on: CRM → Contacts, tick the lead, Bulk actions → "Add tag" for the next stage, then "Remove tag" for the old one. Show me this.');
      p('- Keep **double opt-in** on (CRM → Settings; it is on by default).');
      var welcome = spec.crm.emails.filter(function (e) { return e.id === 'welcome'; })[0];
      var campaigns = spec.crm.emails.filter(function (e) { return e.id !== 'welcome'; });
      if (welcome) p('- Welcome email: it is one setting in CRM → Settings, sent to everyone who confirms. Write it there in my voice (', welcome.description.toLowerCase(), ') and leave automatic sending off until I approve it.');
      if (campaigns.length) {
        p('- Save these as **draft campaigns** in my voice, each aimed at the list or stage segment it is for. Do not send anything:');
        campaigns.forEach(function (e) { p('  - ', e.description.replace(/ \(campaign template\)$/, '')); });
      }
      p('');

      p('## Step ', n + 2, ': SEO, accessibility and compliance');
      if (app) p('- ', P.seo.promptLine(spec), ' Use seo_update_page for titles and descriptions. The SEO extension\'s structured data offers Organization or Person: use Organization, and list the more specific business type in your report as a small job for a developer (it needs the `fw_seo_schema_graph` filter).');
      else p('- ', P.seo.promptLine(spec), ' The SEO extension\'s own structured data only offers Organization or Person, so add this type through its `fw_seo_schema_graph` filter in the child theme, and leave out unknown values rather than publishing placeholders.');
      p('- Meet WCAG 2.2 AA: real headings in order, alt text on every image, labeled form fields, visible focus and enough contrast.');
      p('- Keep pages fast: compressed images and lazy loading below the fold. The Asset Optimizer extension can help once real photos are in.');
      p('- ', P.compliance.footerLine(b));
      (P.compliance.extraLines ? P.compliance.extraLines(s) : []).forEach(function (l) { p('- ', l); });
      p('');

      p('## Step ', n + 3, ': Check everything and report back');
      if (app) p('Run render_check on every page and fix what it reports. Then ask me to look at each page on a computer and a phone, and to submit each form once (ticking the consent box on one): no tool reads entries or subscribers, by design, so ask me to confirm the entries appear under **Unyson+ → Form Entries** and that the test lead appears under **CRM → Contacts** with the first stage tag, then to delete those test records. If a notification email fails, the visitor still sees the success message and the entry notes "Notification email: Not sent": tell me, because live sites need working email (SMTP).');
      else p('Open every page at desktop and phone width and fix anything broken or misaligned, including sideways scrolling on phones. Submit each form once and confirm the entry appears under **Unyson+ → Form Entries**, and that a test lead who ticks the consent box appears in the CRM with the first stage tag. Then delete the test entries and subscribers. If a notification email fails, the visitor still sees the success message and the entry notes "Notification email: Not sent": tell me, because live sites need working email (SMTP).');
      if (!app && s.wp === 'host' && s.access === 'migrate') p('Then, once I approve the local site, move it to my web host: use the Unyson+ Site Migration extension if it fits, or my host\'s own migration tool, and walk me through every step I have to do myself. Never ask for my hosting password.');
      p('Finish with a short report: what you built, what still needs me (', P.prompt.needs(s), '), and how I edit ', P.prompt.editWhat, ' in wp-admin.');
      if (app) p('Last, remind me that I can switch the connector to read-only, or disconnect it, on the Unyson+ AI Assistant screen now that the build is done.');
      p('');

      p('## Rules');
      p('- Never invent facts about the business: no made-up awards, sales numbers, years in business, reviews or team members. Use clearly marked placeholders such as [', P.prompt.placeholderExample, '] instead.');
      p('- Use Unyson+ features before adding any plugin. ', P.prompt.pluginRule);
      (P.prompt.rules || []).forEach(function (r) { p('- ', r); });
      p('- Ask before deleting or overwriting anything you did not create.');
      p('- Never ask me for a password, and never ask me to paste the details of real leads or customers into this conversation.');
      p('- If the ', app ? 'build docs' : 'kit\'s docs', ' and this prompt disagree about how a feature works, the docs win; tell me what you changed.');
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
      var items = s.track === 'agent'
        ? [
          { label: s.wp === 'host' && s.access !== 'migrate' ? 'A fresh WordPress (or staging copy) on your host, with a backup taken' : 'A fresh WordPress on your computer', prep: true },
          { label: AGENTS[s.agent] + ', installed and signed in', prep: true }
        ]
        : [
          { label: 'A fresh WordPress (or staging copy) on your web host, with HTTPS and a backup taken', prep: true },
          { label: 'Unyson+ installed and activated, then ' + SETUP_PAGE + ' → "Set up this site for an AI app"', prep: true },
          { label: 'In Claude: the connector added from that page, and "Sign in to your site" approved', prep: true }
        ];
      items.push({ label: 'Business name', done: miss.indexOf('name') === -1 });
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
    var lastResume = '';

    /* A new chat after an interruption: the same prompt, led by "check what is done first". */
    function buildResume(prompt) {
      return ['# Resume my site build', '', 'We were interrupted while building my site through the Unyson+ connector. Do not start over. First call site_info, crm_describe and get_page on the pages that exist to see what is already done, compare it with the plan below, tell me which stage we are in and what is left, then carry on one stage per reply with the same rules.', '', '---', '', prompt].join('\n');
    }
    var lastSpec = '';
    var saveTimer;

    function render(flash) {
      syncPresets();
      var s = readState();
      var spec = buildSpec(s);
      lastSpec = JSON.stringify(spec, null, 2);
      lastPrompt = buildPrompt(spec, s);
      lastResume = buildResume(lastPrompt);
      promptOut.textContent = lastPrompt;
      specOut.textContent = lastSpec;
      renderPreview(spec);
      renderChecklist(s);
      meta.textContent = lastPrompt.split(/\s+/).length.toLocaleString() + ' words · paste into ' + target(s);
      if (flash) {
        var pre = document.querySelector('.out__panel:not([hidden]) > *');
        if (pre) { pre.classList.remove('flash'); void pre.offsetWidth; pre.classList.add('flash'); }
      }
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable */ }
      }, 250);
    }

    /* Where the prompt goes, in words. */
    function target(s) {
      return s.track === 'agent' ? AGENTS[s.agent] : 'a Claude chat with the Unyson+ connector on';
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
      else copyText(lastPrompt, 'Prompt copied. Paste it into ' + target(readState()) + '.');
    });
    document.getElementById('resume').addEventListener('click', function () {
      copyText(lastResume, 'Resume message copied. Paste it into a new Claude chat with the Unyson+ connector on.');
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
