/* Real estate preset: agents, teams and brokerages. Listings use the Properties blueprint. */
CRMGEN.register({
  id: 'real-estate',
  path: '/real-estate-crm-website/',
  label: 'Real estate',
  legacyStoreKey: 'crmgen:v1', // state saved when real estate was the only preset

  page: {
    title: 'Free Real Estate CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free real estate CRM website on WordPress: property listings, IDX-ready search, showing and valuation forms, and a lead pipeline. Copy the prompt for your AI agent. No sign-up.',
    h1: 'Free real estate CRM website for WordPress',
    lede: 'Listings, showing requests, home valuations and a lead pipeline for agents, teams and brokerages. Pick what you need and copy a build prompt your AI agent turns into a working site, built on the free Unyson+ framework.',
    note: 'Works with manual listings or the IDX provider you already use.',
    ogAlt: 'The real estate CRM website generator: listings and a lead pipeline',
    genTitle: 'Build your real estate CRM website spec',
    schemaName: 'Free Real Estate CRM Website Generator',
    included: [
      { t: 'Property listings', d: 'A Properties post type with price, beds, baths, area, map, gallery and virtual tour, plus filters by type, location and features.' },
      { t: 'Lead capture forms', d: 'Contact, showing request, home valuation, buyer consultation and listing alerts. Every submission is stored as an entry, not only emailed.' },
      { t: 'Contacts and pipeline', d: 'Leads go into the built-in CRM with a tag for each pipeline stage, so you can see who is new, who has a showing booked and who has closed.' },
      { t: 'Email follow-up', d: 'Welcome emails, new listing announcements and market updates sent to lists and saved segments, with double opt-in and unsubscribe links.' },
      { t: 'Search engine ready', d: 'Clean titles and descriptions, Open Graph tags, structured data and a sitemap from the SEO extension.' },
      { t: 'Compliance built in', d: 'Brokerage name, license number and an Equal Housing Opportunity statement in the footer, and consent checkboxes on every form.' }
    ],
    callout: {
      title: 'A note on MLS and IDX',
      html: 'No website tool can pull MLS listings on its own. MLS data comes through an IDX agreement between you, your brokerage and your MLS, usually delivered by an IDX provider. If you have one, choose <b>My IDX provider</b> above and the agent will install that provider\'s official plugin or embed. Your lead forms and CRM work the same either way. If you do not have one yet, start with manual listings; you can add IDX later without rebuilding the site.'
    },
    faq: [
      { q: 'Is the real estate CRM website generator free?', a: 'Yes. The generator, the Unyson+ plugin and theme, and the AI Dev Kit are free. You only pay for your own hosting and, if you use one, your AI agent subscription.' },
      { q: 'Does it connect to the MLS or include IDX?', a: 'MLS data requires your own IDX agreement through your brokerage and MLS. The generator supports two routes: manual listings you add yourself, or an IDX provider you already use, whose plugin or widget the agent installs. Leads from either route go into the same CRM.' },
      { q: 'Which IDX providers work?', a: 'Any provider that offers a WordPress plugin or embed code, such as IDX Broker, Showcase IDX, myRealPage, Real Geeks or iHomefinder. The agent follows that provider\'s own installation steps and asks you for your account details.' },
      { q: 'Do I need to know how to code?', a: 'No. You fill in a form and copy the result. Your AI agent does the building. After it is built, the site is edited in the WordPress admin with a visual page builder.' },
      { q: 'Is it suitable for a brokerage with several agents?', a: 'Yes. Choose Brokerage or Agent team as the business type and the generator adds an Our agents page. Each listing can carry a listing agent.' }
    ]
  },

  business: {
    types: [
      { value: 'solo', label: 'Solo agent', promptLabel: 'solo agent' },
      { value: 'team', label: 'Agent team', promptLabel: 'agent team', selected: true },
      { value: 'brokerage', label: 'Brokerage', promptLabel: 'brokerage' }
    ],
    namePlaceholder: 'Harbor & Pine Realty',
    marketLabel: 'Market or city',
    marketPlaceholder: 'Austin, TX',
    marketAsk: 'the market or city I serve',
    taglinePlaceholder: 'Homes in Austin, sold with care',
    fields: [
      { name: 'brokerage', label: 'Brokerage name', hint: 'if different' },
      { name: 'license', label: 'License number', hint: 'optional' }
    ],
    toSpec: function (s, name) {
      return {
        brokerage: s.brokerage || (s.businessType === 'brokerage' ? name : null),
        license_number: s.license || null
      };
    }
  },

  audience: {
    legend: 'Who you serve',
    fallback: 'buyers and sellers',
    options: [
      { value: 'buyers', label: 'Buyers', checked: true },
      { value: 'sellers', label: 'Sellers', checked: true },
      { value: 'renters', label: 'Renters' },
      { value: 'investors', label: 'Investors' },
      { value: 'luxury', label: 'Luxury' },
      { value: 'relocation', label: 'Relocation' }
    ]
  },

  pages: [
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
  ],

  content: {
    legend: 'Listings',
    specKey: 'listings',
    sourcesLabel: 'Where listings come from',
    sources: [
      { value: 'manual', title: 'I add them myself', desc: 'Listings are WordPress posts you manage', checked: true },
      { value: 'idx', title: 'My IDX provider', desc: 'Live MLS search from a service you use' },
      { value: 'both', title: 'Both', desc: 'Featured listings plus full MLS search' }
    ],
    provider: {
      label: 'IDX provider',
      when: ['idx', 'both'],
      placeholder: 'Choose your provider',
      options: ['IDX Broker', 'Showcase IDX', 'myRealPage', 'Real Geeks', 'iHomefinder', 'Other / not sure yet'],
      hint: 'MLS data needs your own IDX agreement through your brokerage. The agent installs the provider\'s plugin or embed code; it will ask you for your account details and never invents them.'
    },
    includedText: 'Always included: price, bedrooms, bathrooms, floor area, address, map, gallery, virtual tour, and property type, location and feature filters.',
    extrasLabel: 'Extra listing details',
    extras: [
      { value: 'status', label: 'Status (for sale, sold…)', checked: true, specLabel: 'Status', taxonomy: 'property_status', terms: ['For sale', 'For rent', 'Pending', 'Sold'] },
      { value: 'year_built', label: 'Year built', checked: true, key: 'property_year_built', type: 'number' },
      { value: 'lot_size', label: 'Lot size', key: 'property_lot_size', type: 'unit', units: 'm2, ft2, acres' },
      { value: 'parking', label: 'Parking', key: 'property_parking', type: 'text' },
      { value: 'hoa', label: 'HOA fees', key: 'property_hoa', type: 'text' },
      { value: 'mls_number', label: 'MLS number', key: 'property_mls_number', type: 'text' },
      { value: 'open_house', label: 'Open house date', checked: true, key: 'property_open_house', type: 'datetime' },
      { value: 'listing_agent', label: 'Listing agent', key: 'property_agent', type: 'relation-user' },
      { value: 'brochure', label: 'PDF brochure', key: 'property_brochure', type: 'file' }
    ],
    samples: { label: 'Sample listings to create', options: [0, 3, 6], selected: 6 },

    toSpec: function (s) {
      var extra = this.extras.filter(function (x) { return s.extras.indexOf(x.value) !== -1; });
      var src = s.source;
      return {
        source: src,
        idx_provider: src === 'manual' ? null : (s.provider || 'to be confirmed'),
        post_type: src !== 'idx' ? {
          blueprint: 'properties',
          key: 'property',
          archive_slug: 'properties',
          taxonomies: ['property_type', 'property_location', 'property_feature'].concat(extra.filter(function (f) { return f.taxonomy; }).map(function (f) { return f.taxonomy; })),
          base_fields: ['property_price', 'property_beds', 'property_baths', 'property_area', 'property_address', 'property_map', 'property_gallery', 'property_tour'],
          extra_fields: extra.filter(function (f) { return f.key; }).map(function (f) { var o = { label: f.label, key: f.key, type: f.type }; if (f.units) o.units = f.units; return o; }),
          extra_taxonomies: extra.filter(function (f) { return f.taxonomy; }).map(function (f) { return { label: f.specLabel, key: f.taxonomy, terms: f.terms }; }),
          filters: ['property_type', 'property_location', 'property_feature'].concat(s.extras.indexOf('status') !== -1 ? ['property_status'] : []),
          sample_listings: parseInt(s.samples, 10) || 0
        } : null
      };
    },

    promptLines: function (L, s) {
      var out = [];
      function p() { out.push(Array.prototype.join.call(arguments, '')); }
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
        p('- **Single listing layout:** gallery at the top, price and key facts (beds, baths, area', s.extras.indexOf('status') !== -1 ? ', status' : '', '), description, features, map, virtual tour, ', s.forms.indexOf('showing') !== -1 ? 'the "Schedule a showing" form, ' : '', 'and an agent contact card. Look up in the kit how to build a reusable single-post layout from the dynamic post elements.');
        if (pt.sample_listings) p('- Create ', pt.sample_listings, ' sample listings across different property types and locations so every page has content. Put "Sample" at the start of each title so I can find and replace them. Use fictional addresses and only images you have the right to use.');
        else p('- Do not create sample listings; I will add my own.');
      }
      if (L.source !== 'manual') {
        p('- **IDX search (', L.idx_provider, '):** ask me for my IDX account details. Install that provider\'s official WordPress plugin or embed code exactly as their documentation describes, and put the search on the "Property search" page. Show the MLS disclaimer text the provider supplies. If the provider can send new leads to a webhook or email, route them into the CRM below; if not, tell me which leads stay in the provider\'s own system. Never invent credentials or copy listings by hand from the MLS.');
      }
      return out;
    }
  },

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'showing', title: 'Schedule a showing', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Preferred date (date)', 'Message', 'Listing (hidden: page title)'], where: 'Every single listing page', on: true },
    { id: 'valuation', title: 'Home valuation', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Property address', 'Property type', 'Bedrooms', 'Bathrooms', 'When do you plan to sell?'], where: 'Selling your home page and the home page', audience: 'sellers' },
    { id: 'consult', title: 'Buyer consultation', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Budget range', 'Areas of interest', 'Timeline', 'Pre-approved for a mortgage? (yes / no / not yet)'], where: 'Buying a home page', audience: 'buyers' },
    { id: 'alerts', title: 'Listing alerts signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Areas of interest', 'Consent to receive listing emails'], where: 'Properties page and blog sidebar', on: true },
    { id: 'rental', title: 'Rental inquiry', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Move-in date (date)', 'Number of occupants', 'Listing (hidden: page title)'], where: 'Rental listings', audience: 'renters' }
  ],

  stages: ['New lead', 'Contacted', 'Appointment set', 'Showing or valuation done', 'Offer or listing signed', 'Under contract', 'Closed', 'Not now'],

  emails: [
    { value: 'welcome', label: 'Welcome email', checked: true, description: 'Welcome email sent when someone confirms their subscription' },
    { value: 'new_listing', label: 'New listing announcements', checked: true, description: 'New listing announcement (campaign template)' },
    { value: 'just_sold', label: 'Just sold', description: 'Just sold announcement (campaign template)' },
    { value: 'market_update', label: 'Monthly market update', description: 'Monthly market update (campaign template)' },
    { value: 'valuation_followup', label: 'Valuation follow-up', description: 'Follow-up for home valuation requests (campaign template)' }
  ],

  styles: {
    modern: 'Modern and clean: generous white space, a crisp sans-serif, large listing photos, minimal decoration.',
    friendly: 'Warm and friendly: rounded shapes, approachable type, real photos of people and neighborhoods, inviting copy.'
  },

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: (s.market ? s.market + ' ' : '') + 'real estate', schema: ['RealEstateAgent', 'LocalBusiness'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" on the home page and use the market name naturally on location and neighborhood pages. Use ' + spec.seo.schema.join(' and ') + ' structured data for the business.';
    }
  },

  compliance: {
    toSpec: function (s) {
      return { equal_housing_statement: true, brokerage_and_license_in_footer: true, privacy_policy: true, form_consent: true, mls_disclaimer: s.source !== 'manual' };
    },
    footerLine: function (b) {
      return 'Footer: ' + (b.brokerage ? 'brokerage name (' + b.brokerage + '), ' : 'brokerage name, ') + (b.license_number ? 'license number (' + b.license_number + '), ' : 'license number (ask me), ') + 'an Equal Housing Opportunity statement, and a link to the privacy policy.';
    }
  },

  missing: function (s) {
    return s.source !== 'manual' && !s.provider ? [{ id: 'provider', label: 'IDX provider', ask: 'which IDX provider I use' }] : [];
  },
  prepare: function (s) {
    var out = ['Listing photos you have the rights to'];
    if (s.businessType !== 'solo') out.push('Agent headshots and short bios');
    if (s.source !== 'manual') out.push('Your IDX account login');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a real estate CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete real estate website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Market: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.brokerage) out.push('- Brokerage: ' + b.brokerage);
      if (b.license_number) out.push('- License number: ' + b.license_number);
      return out;
    },
    needs: function (s) { return 'photos, logo, real listings' + (s.source !== 'manual' ? ', IDX account details' : '') + ', copy to review'; },
    editWhat: 'listings, forms and leads',
    placeholderExample: 'Add your sales record',
    pluginRule: 'The only third-party plugin allowed is the IDX provider\'s, if one is chosen.'
  }
});
