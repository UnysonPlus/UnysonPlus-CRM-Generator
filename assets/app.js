/* Free CRM Website Generator: form -> site-spec.json + build prompt.
   Runs entirely in the browser. State is kept in localStorage and can be shared via the URL hash. */
(function () {
  'use strict';

  var SPEC_VERSION = '1.0';
  var STORE_KEY = 'crmgen:v1';
  var KIT_URL = 'https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit';
  var PLUGIN_ZIP = 'https://github.com/UnysonPlus/UnysonPlus/releases/latest/download/unysonplus.zip';
  var THEME_REPO = 'https://github.com/UnysonPlus/UnysonPlus-Theme';

  /* ---------- Real estate preset ---------- */

  var PAGES = [
    { id: 'home', title: 'Home', purpose: 'Hero with a property search or featured listings, value proposition, featured listings, services for buyers and sellers, client stories, lead form call to action.', required: true },
    { id: 'properties', title: 'Properties', purpose: 'All listings with filters by property type, location and features.', source: ['manual', 'both'] },
    { id: 'search', title: 'Property search', purpose: 'Full MLS search from the IDX provider.', source: ['idx', 'both'] },
    { id: 'buy', title: 'Buying a home', purpose: 'The buying process step by step, with the buyer consultation form.', audience: 'buyers' },
    { id: 'sell', title: 'Selling your home', purpose: 'How you market and sell a home, with the home valuation form.', audience: 'sellers' },
    { id: 'rentals', title: 'Rentals', purpose: 'Rental listings and the rental inquiry form.', audience: 'renters' },
    { id: 'invest', title: 'Investors', purpose: 'Investment property services and how to get deal alerts.', audience: 'investors' },
    { id: 'relocation', title: 'Relocating here', purpose: 'A guide for people moving to the area, with a consultation form.', audience: 'relocation' },
    { id: 'neighborhoods', title: 'Neighborhoods', purpose: 'One section per area served, each linking to its listings.', on: true },
    { id: 'about', title: 'About', purpose: 'Story, experience and credentials.', on: true },
    { id: 'agents', title: 'Our agents', purpose: 'Team members with photos, contact details and their listings.', type: ['team', 'brokerage'] },
    { id: 'stories', title: 'Client stories', purpose: 'Testimonials from buyers and sellers.', on: true },
    { id: 'blog', title: 'Market updates', purpose: 'Blog for market reports and local guides (good for search traffic).', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, office address and map.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How lead data is collected, stored and used.', required: true }
  ];

  var FORMS = [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'showing', title: 'Schedule a showing', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Preferred date (date)', 'Message', 'Listing (hidden: page title)'], where: 'Every single listing page', on: true },
    { id: 'valuation', title: 'Home valuation', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Property address', 'Property type', 'Bedrooms', 'Bathrooms', 'When do you plan to sell?'], where: 'Selling your home page and the home page', audience: 'sellers' },
    { id: 'consult', title: 'Buyer consultation', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Budget range', 'Areas of interest', 'Timeline', 'Pre-approved for a mortgage? (yes / no / not yet)'], where: 'Buying a home page', audience: 'buyers' },
    { id: 'alerts', title: 'Listing alerts signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Areas of interest', 'Consent to receive listing emails'], where: 'Properties page and blog sidebar', on: true },
    { id: 'rental', title: 'Rental inquiry', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Move-in date (date)', 'Number of occupants', 'Listing (hidden: page title)'], where: 'Rental listings', audience: 'renters' }
  ];

  var EXTRA_FIELDS = {
    status: { label: 'Status', taxonomy: 'property_status', terms: ['For sale', 'For rent', 'Pending', 'Sold'] },
    year_built: { label: 'Year built', key: 'property_year_built', type: 'number' },
    lot_size: { label: 'Lot size', key: 'property_lot_size', type: 'unit', units: 'm2, ft2, acres' },
    parking: { label: 'Parking', key: 'property_parking', type: 'text' },
    hoa: { label: 'HOA fees', key: 'property_hoa', type: 'text' },
    mls_number: { label: 'MLS number', key: 'property_mls_number', type: 'text' },
    open_house: { label: 'Open house date', key: 'property_open_house', type: 'datetime' },
    listing_agent: { label: 'Listing agent', key: 'property_agent', type: 'relation-user' },
    brochure: { label: 'PDF brochure', key: 'property_brochure', type: 'upload' }
  };

  var EMAILS = {
    welcome: 'Welcome email sent when someone confirms their subscription',
    new_listing: 'New listing announcement (campaign template)',
    just_sold: 'Just sold announcement (campaign template)',
    market_update: 'Monthly market update (campaign template)',
    valuation_followup: 'Follow-up for home valuation requests (campaign template)'
  };

  var STYLES = {
    modern: 'Modern and clean: generous white space, a crisp sans-serif, large listing photos, minimal decoration.',
    classic: 'Classic and trusted: a refined serif for headings with a readable sans-serif body, structured layouts, calm colors.',
    luxury: 'Luxury: full-bleed photography, elegant display type, restrained color, lots of space, slow subtle motion.',
    friendly: 'Warm and friendly: rounded shapes, approachable type, real photos of people and neighborhoods, inviting copy.'
  };

  var AGENTS = {
    'claude-code': 'Claude Code',
    cursor: 'Cursor',
    codex: 'Codex',
    other: 'your coding agent'
  };

  var DEFAULT_STAGES = ['New lead', 'Contacted', 'Appointment set', 'Showing or valuation done', 'Offer or listing signed', 'Under contract', 'Closed', 'Not now'];

  /* ---------- DOM ---------- */

  var form = document.getElementById('form');
  var pagesBox = document.getElementById('pages');
  var formsBox = document.getElementById('forms');
  var idxField = document.getElementById('idxField');
  var promptOut = document.getElementById('promptOut');
  var specOut = document.getElementById('specOut');
  var meta = document.getElementById('meta');
  var status = document.getElementById('status');
  var copyBtn = document.getElementById('copy');
  var downloadBtn = document.getElementById('download');
  var shareBtn = document.getElementById('share');
  var tabs = [document.getElementById('tab-prompt'), document.getElementById('tab-spec')];
  var activeTab = 'prompt';
  var touched = {}; // checkboxes the user set by hand keep their value when presets change

  function checkItem(name, item) {
    var label = document.createElement('label');
    label.className = 'check';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    input.value = item.id;
    if (item.required) { input.checked = true; input.disabled = true; }
    var text = document.createElement('span');
    var b = document.createElement('b');
    b.textContent = item.title + (item.required ? ' (always included)' : '');
    var small = document.createElement('small');
    small.textContent = item.purpose || ('Placed on: ' + item.where);
    text.appendChild(b); text.appendChild(small);
    label.appendChild(input); label.appendChild(text);
    return label;
  }
  PAGES.forEach(function (p) { pagesBox.appendChild(checkItem('pages', p)); });
  FORMS.forEach(function (f) { formsBox.appendChild(checkItem('forms', f)); });

  /* ---------- State ---------- */

  function values(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; });
  }
  function val(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function readState() {
    return {
      vertical: val('vertical'),
      businessType: val('businessType'),
      name: val('name'),
      market: val('market'),
      tagline: val('tagline'),
      brokerage: val('brokerage'),
      license: val('license'),
      audience: values('audience'),
      pages: values('pages'),
      listingSource: (form.querySelector('input[name="listingSource"]:checked') || {}).value || 'manual',
      idxProvider: val('idxProvider'),
      extraFields: values('extraFields'),
      samples: val('samples'),
      forms: values('forms'),
      leadEmail: val('leadEmail'),
      stages: val('stages'),
      emails: values('emails'),
      primary: val('primary'),
      accent: val('accent'),
      style: val('style'),
      logo: val('logo'),
      language: val('language'),
      agent: val('agent'),
      wp: val('wp'),
      touched: touched
    };
  }

  function applyState(s) {
    if (!s) return;
    touched = s.touched || {};
    ['vertical', 'businessType', 'name', 'market', 'tagline', 'brokerage', 'license', 'idxProvider', 'samples', 'leadEmail', 'stages', 'primary', 'accent', 'style', 'logo', 'language', 'agent', 'wp'].forEach(function (k) {
      if (s[k] != null && form.elements[k]) form.elements[k].value = s[k];
    });
    ['audience', 'pages', 'forms', 'extraFields', 'emails'].forEach(function (k) {
      if (!Array.isArray(s[k])) return;
      form.querySelectorAll('input[name="' + k + '"]').forEach(function (i) { if (!i.disabled) i.checked = s[k].indexOf(i.value) !== -1; });
    });
    var radio = form.querySelector('input[name="listingSource"][value="' + (s.listingSource || 'manual') + '"]');
    if (radio) radio.checked = true;
  }

  /* Pages and forms follow audience, business type and listing source unless the user ticked them by hand. */
  function syncPresets() {
    var aud = values('audience');
    var type = val('businessType');
    var src = (form.querySelector('input[name="listingSource"]:checked') || {}).value || 'manual';
    function wanted(item) {
      if (item.required) return true;
      if (item.source) return item.source.indexOf(src) !== -1;
      if (item.audience) return aud.indexOf(item.audience) !== -1;
      if (item.type) return item.type.indexOf(type) !== -1;
      return !!item.on;
    }
    PAGES.forEach(function (p) {
      var el = pagesBox.querySelector('input[value="' + p.id + '"]');
      if (p.source) { el.checked = wanted(p); return; } // listing pages always follow the source
      if (!touched['pages:' + p.id]) el.checked = wanted(p);
    });
    FORMS.forEach(function (f) {
      var el = formsBox.querySelector('input[value="' + f.id + '"]');
      if (!touched['forms:' + f.id]) el.checked = wanted(f);
    });
    idxField.hidden = src === 'manual';
  }

  /* ---------- Spec ---------- */

  function lines(s) { return s.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function buildSpec(s) {
    var stages = lines(s.stages);
    if (!stages.length) stages = DEFAULT_STAGES.slice();
    var src = s.listingSource;
    var useCpt = src !== 'idx';
    var extra = s.extraFields.map(function (k) { return EXTRA_FIELDS[k]; }).filter(Boolean);
    var name = s.name || '[Business name]';

    return {
      spec_version: SPEC_VERSION,
      generator: 'https://crm.unysonplus.com/',
      vertical: 'real-estate',
      business: {
        name: name,
        type: s.businessType,
        market: s.market || '[Market or city]',
        tagline: s.tagline || null,
        brokerage: s.brokerage || (s.businessType === 'brokerage' ? name : null),
        license_number: s.license || null,
        audience: s.audience,
        language: s.language || 'English'
      },
      pages: PAGES.filter(function (p) { return s.pages.indexOf(p.id) !== -1 || p.required; }).map(function (p) {
        return { slug: p.id === 'home' ? '' : slug(p.title), title: p.title, purpose: p.purpose };
      }),
      listings: {
        source: src,
        idx_provider: src === 'manual' ? null : (s.idxProvider || 'to be confirmed'),
        post_type: useCpt ? {
          blueprint: 'properties',
          key: 'property',
          archive_slug: 'properties',
          taxonomies: ['property_type', 'property_location', 'property_feature'].concat(extra.filter(function (f) { return f.taxonomy; }).map(function (f) { return f.taxonomy; })),
          base_fields: ['property_price', 'property_beds', 'property_baths', 'property_area', 'property_address', 'property_map', 'property_gallery', 'property_tour'],
          extra_fields: extra.filter(function (f) { return f.key; }).map(function (f) { var o = { label: f.label, key: f.key, type: f.type }; if (f.units) o.units = f.units; return o; }),
          extra_taxonomies: extra.filter(function (f) { return f.taxonomy; }).map(function (f) { return { label: f.label, key: f.taxonomy, terms: f.terms }; }),
          filters: ['property_type', 'property_location', 'property_feature'].concat(s.extraFields.indexOf('status') !== -1 ? ['property_status'] : []),
          sample_listings: parseInt(s.samples, 10) || 0
        } : null
      },
      lead_capture: {
        notify_email: s.leadEmail || '[ask the owner]',
        forms: FORMS.filter(function (f) { return s.forms.indexOf(f.id) !== -1 || f.required; }).map(function (f) {
          return { id: f.id, title: f.title, starter: f.starter, fields: f.fields, placement: f.where, actions: ['store_entry', 'subscribe_with_consent'] };
        })
      },
      crm: {
        engine: 'newsletter-crm',
        pipeline: { method: 'tags', tag_prefix: 'Stage: ', stages: stages, saved_segment_per_stage: true },
        lists: s.audience.map(function (a) { return a.charAt(0).toUpperCase() + a.slice(1); }),
        double_opt_in: true,
        emails: s.emails.map(function (e) { return { id: e, description: EMAILS[e] }; })
      },
      brand: {
        primary: s.primary,
        accent: s.accent,
        style: s.style,
        style_notes: STYLES[s.style],
        logo: s.logo === 'have' ? 'owner will supply a logo file' : 'text logo from the business name'
      },
      seo: {
        primary_keyword: (s.market ? s.market + ' ' : '') + 'real estate',
        schema: ['RealEstateAgent', 'LocalBusiness'],
        local: true
      },
      compliance: {
        equal_housing_statement: true,
        brokerage_and_license_in_footer: true,
        privacy_policy: true,
        form_consent: true,
        mls_disclaimer: src !== 'manual'
      },
      build: {
        agent: s.agent,
        wordpress: s.wp,
        ai_dev_kit: KIT_URL,
        plugin: PLUGIN_ZIP,
        parent_theme: THEME_REPO,
        extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo']
      }
    };
  }

  /* ---------- Prompt ---------- */

  function buildPrompt(spec, s) {
    var b = spec.business;
    var L = spec.listings;
    var out = [];
    function p() { out.push(Array.prototype.join.call(arguments, '')); }

    p('# Build a real estate CRM website for ', b.name, ' with UnysonPlus');
    p('');
    p('You are building a complete real estate website with a built-in CRM on WordPress, using the free UnysonPlus framework. Everything I chose is in the site spec at the end of this prompt. Save it as `site-spec.json` in the project folder and treat it as the source of truth; this prompt explains the order of work and the rules.');
    p('');
    p('## About the business');
    p('- Name: ', b.name, ' (', { solo: 'solo agent', team: 'agent team', brokerage: 'brokerage' }[b.type] || b.type, ')');
    p('- Market: ', b.market);
    if (b.tagline) p('- Tagline: ', b.tagline);
    if (b.brokerage) p('- Brokerage: ', b.brokerage);
    if (b.license_number) p('- License number: ', b.license_number);
    p('- Serves: ', b.audience.length ? b.audience.join(', ') : 'buyers and sellers');
    p('- Site language: ', b.language);
    p('');

    p('## Step 0: Setup');
    if (s.wp === 'local') p('WordPress is installed on this computer. Find its folder and admin URL, or ask me if you cannot.');
    else if (s.wp === 'host') p('WordPress is on my web host. Ask me how you can reach it (SSH with WP-CLI is best). Never write passwords or keys into project files.');
    else p('WordPress is not installed yet. Help me set up a local WordPress install first, then continue. Use a fresh install with no other page builder.');
    p('1. Get the AI Dev Kit: clone ', KIT_URL, '. Read `AGENTS.md` first, then `docs/site-build-protocol.md`. This is a **fresh build** (there is no source site to copy), so follow the fresh-build path. Before using any element, extension or option, look it up in the kit\'s `docs/` folder instead of guessing.');
    p('2. Install the UnysonPlus plugin from ', PLUGIN_ZIP, ' and the parent theme from ', THEME_REPO, ' (latest release; the theme folder must be named `unysonplus-theme`). Create a child theme for this site from the kit\'s child-theme starter and activate it.');
    p('3. In **Unyson+ → Extensions**, enable: Post Types, Custom Fields, Forms, Newsletter CRM and SEO. Install any that are missing through the Extensions manager.');
    p('');

    p('## Step 1: Design system first');
    p('Set **Theme Settings** before building any page: colors, typography, buttons, spacing and the header and footer. Build every page from these settings so the site stays consistent.');
    p('- Primary color: ', spec.brand.primary, '; accent color: ', spec.brand.accent, ' (use the accent for main calls to action). Derive the remaining shades from these two and check text contrast meets WCAG AA.');
    p('- Style: ', spec.brand.style_notes);
    p('- Logo: ', s.logo === 'have' ? 'ask me for my logo file.' : 'set the business name as a text logo.');
    p('');

    p('## Step 2: Listings');
    if (L.post_type) {
      var pt = L.post_type;
      p('Go to **Unyson+ → Post Types → Blueprints** and install **Properties**. It creates the `property` post type (archive at `/properties/`), the taxonomies `property_type`, `property_location` and `property_feature`, and a "Listing Details" field group with price, bedrooms, bathrooms, floor area, address, map location, gallery and virtual tour.');
      if (pt.extra_fields.length) {
        p('Add these fields to the Listing Details group with the Custom Fields extension:');
        pt.extra_fields.forEach(function (f) { p('- ', f.label, ': key `', f.key, '`, type `', f.type, '`', f.units ? ' (units: ' + f.units + ')' : ''); });
      }
      pt.extra_taxonomies.forEach(function (t) {
        p('Add a taxonomy **', t.label, '** (`', t.key, '`) on `property` with the terms: ', t.terms.join(', '), '. It is a taxonomy, not a field, so visitors can filter by it.');
      });
      p('- **Properties page:** use the `posts` element with post type `property` and live filters on, filtering by ', pt.filters.map(function (f) { return '`' + f + '`'; }).join(', '), '. Check `docs/shortcodes/posts.md` for the exact options.');
      p('- **Single listing layout:** gallery at the top, price and key facts (beds, baths, area', s.extraFields.indexOf('status') !== -1 ? ', status' : '', '), description, features, map, virtual tour, ', s.forms.indexOf('showing') !== -1 ? 'the "Schedule a showing" form, ' : '', 'and an agent contact card. Look up in the kit how to build a reusable single-post layout from the dynamic post elements.');
      if (pt.sample_listings) p('- Create ', pt.sample_listings, ' sample listings across different property types and locations so every page has content. Put "Sample" at the start of each title so I can find and replace them. Use fictional addresses and only images you have the right to use.');
      else p('- Do not create sample listings; I will add my own.');
    }
    if (L.source !== 'manual') {
      p('- **IDX search (', L.idx_provider, '):** ask me for my IDX account details. Install that provider\'s official WordPress plugin or embed code exactly as their documentation describes, and put the search on the "Property search" page. Show the MLS disclaimer text the provider supplies. If the provider can send new leads to a webhook or email, route them into the CRM below; if not, tell me which leads stay in the provider\'s own system. Never invent credentials or copy listings by hand from the MLS.');
    }
    p('');

    p('## Step 3: Pages');
    spec.pages.forEach(function (pg) { p('- **', pg.title, '** (`/', pg.slug, pg.slug ? '/' : '', '`): ', pg.purpose); });
    p('Add every page to the main menu in a sensible order, with Contact last as a button. Each page ends with a clear call to action leading to a lead form.');
    p('');

    p('## Step 4: Lead capture');
    p('Build each form with the Forms extension, starting from the named starter form where one fits. On every form keep the **Store entry** action on, send notifications to ', spec.lead_capture.notify_email, ', and add an optional **Consent** field (purpose: newsletter) with the **Subscribe to the newsletter** action, so only people who agree are added to email lists.');
    spec.lead_capture.forms.forEach(function (f) {
      p('- **', f.title, '** (starter: ', f.starter, '). Fields: ', f.fields.join(', '), '. Place on: ', f.placement, '.');
    });
    p('');

    p('## Step 5: CRM');
    p('Use the **Newsletter CRM** extension as the CRM. Do not build custom CRM tables or a custom CRM plugin.');
    if (spec.crm.lists.length) p('- Create lists: ', spec.crm.lists.join(', '), '. Each form adds its leads to the matching list.');
    p('- Pipeline: create one tag per stage, named with the prefix "Stage: ": ', spec.crm.pipeline.stages.map(function (x) { return '"Stage: ' + x + '"'; }).join(', '), '. New leads start in "Stage: ', spec.crm.pipeline.stages[0], '". Save one segment per stage so I can open each stage in one click, and show me how to move a lead to the next stage by changing its tag.');
    p('- Keep double opt-in on.');
    if (spec.crm.emails.length) {
      p('- Emails (write them in my voice, save campaigns as drafts, and do not send anything):');
      spec.crm.emails.forEach(function (e) { p('  - ', e.description); });
    }
    p('');

    p('## Step 6: SEO, accessibility and compliance');
    p('- In the SEO extension, give every page a unique title and description. Target "', spec.seo.primary_keyword, '" on the home page and use the market name naturally on location and neighborhood pages. Use ', spec.seo.schema.join(' and '), ' structured data for the business.');
    p('- Meet WCAG 2.2 AA: real headings in order, alt text on every image, labeled form fields, visible focus and enough contrast.');
    p('- Keep pages fast: compressed images, lazy loading below the fold, and the Asset Optimizer if it helps.');
    p('- Footer: ', b.brokerage ? 'brokerage name (' + b.brokerage + '), ' : 'brokerage name, ', b.license_number ? 'license number (' + b.license_number + '), ' : 'license number (ask me), ', 'an Equal Housing Opportunity statement, and a link to the privacy policy.');
    p('');

    p('## Step 7: Check everything and report back');
    p('Open every page at desktop and phone width and fix anything broken or misaligned. Submit each form once and confirm the entry appears under **Unyson+ → Form Entries**, and that a test lead who ticks the consent box appears in Newsletter CRM with the first stage tag. Then delete the test entries.');
    p('Finish with a short report: what you built, what still needs me (photos, logo, real listings', L.source !== 'manual' ? ', IDX account details' : '', ', copy to review), and how I edit listings, forms and leads in wp-admin.');
    p('');

    p('## Rules');
    p('- Never invent facts about the business: no made-up awards, sales numbers, years in business, reviews or team members. Use clearly marked placeholders such as [Add your sales record] instead.');
    p('- Use UnysonPlus features before adding any plugin. The only third-party plugin allowed is the IDX provider\'s, if one is chosen.');
    p('- Ask before deleting or overwriting anything you did not create.');
    p('- If the kit\'s docs and this prompt disagree about how a feature works, the docs win; tell me what you changed.');
    p('');

    p('## Site spec');
    p('```json');
    p(JSON.stringify(spec, null, 2));
    p('```');
    return out.join('\n');
  }

  /* ---------- Render ---------- */

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
    var words = lastPrompt.split(/\s+/).length;
    meta.textContent = words.toLocaleString() + ' words · paste into ' + AGENTS[s.agent];
    if (flash) {
      var pre = activeTab === 'prompt' ? promptOut : specOut;
      pre.classList.remove('flash'); void pre.offsetWidth; pre.classList.add('flash');
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
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { say(okMsg); }, fallback);
    } else fallback();
  }

  function download(filename, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function fileBase() { return slug(val('name')) || 'crm-site'; }

  function setTab(which) {
    activeTab = which;
    tabs.forEach(function (t) {
      var on = t.id === 'tab-' + which;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    copyBtn.textContent = which === 'prompt' ? 'Copy prompt' : 'Copy spec';
    downloadBtn.textContent = which === 'prompt' ? 'Download prompt' : 'Download site-spec.json';
  }

  /* Share link: state packed into the URL hash (never sent to a server). */
  function encodeState(s) {
    var json = JSON.stringify(s);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeState(str) {
    try {
      var b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) { return null; }
  }

  /* ---------- Events ---------- */

  form.addEventListener('change', function (e) {
    var t = e.target;
    if ((t.name === 'pages' || t.name === 'forms') && t.type === 'checkbox') touched[t.name + ':' + t.value] = true;
    render(true);
  });
  form.addEventListener('input', function (e) {
    if (e.target.type !== 'checkbox' && e.target.type !== 'radio') render(false);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(i === 0 ? 'prompt' : 'spec'); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var next = tabs[(i + 1) % 2];
        next.focus(); next.click();
      }
    });
  });

  copyBtn.addEventListener('click', function () {
    if (activeTab === 'prompt') copyText(lastPrompt, 'Prompt copied. Paste it into ' + AGENTS[val('agent')] + '.');
    else copyText(lastSpec, 'site-spec.json copied.');
  });
  downloadBtn.addEventListener('click', function () {
    if (activeTab === 'prompt') { download(fileBase() + '-build-prompt.md', lastPrompt, 'text/markdown'); say('Prompt downloaded. The spec is included at the end.'); }
    else { download('site-spec.json', lastSpec, 'application/json'); say('site-spec.json downloaded.'); }
  });
  shareBtn.addEventListener('click', function () {
    var url = location.origin + location.pathname + '#s=' + encodeState(readState());
    copyText(url, 'Share link copied. Anyone opening it sees these choices.');
  });

  document.getElementById('reset').addEventListener('click', function () {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    if (location.hash.indexOf('#s=') === 0) history.replaceState(null, '', location.pathname + location.search);
    form.reset();
    touched = {};
    form.elements.stages.value = DEFAULT_STAGES.join('\n');
    render(true);
    say('Reset to the real estate defaults.');
  });

  /* ---------- Boot ---------- */

  form.elements.stages.value = DEFAULT_STAGES.join('\n');
  var initial = null;
  if (location.hash.indexOf('#s=') === 0) initial = decodeState(location.hash.slice(3));
  if (!initial) { try { initial = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { initial = null; } }
  applyState(initial);
  setTab('prompt');
  render(false);
})();
