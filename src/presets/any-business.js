/* Any business preset: the home page generator for businesses outside the industry presets.
   Its content type is Services (the Services blueprint). */
CRMGEN.register({
  id: 'any-business',
  path: '/',
  label: 'Any business',
  heroStages: ['New', 'Quoted', 'Won'],

  page: {
    title: 'Free CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website on WordPress. Pick your industry, services, lead forms and sales pipeline, then copy a ready-made build prompt for your AI agent. No sign-up.',
    h1: 'Free CRM website generator for WordPress',
    lede: 'Choose your services, lead forms and sales pipeline. You get a build prompt and a site spec that your AI agent turns into a working CRM website, built on the free Unyson+ framework.',
    note: 'Pick your industry below, or describe any business in the form.',
    ogAlt: 'The Free CRM Website Generator: a business website with lead forms and a pipeline',
    genTitle: 'Build your CRM website spec',
    schemaName: 'Free CRM Website Generator',
    included: [
      { t: 'Service pages', d: 'A Services post type with a summary, starting price and icon for each service, listed on one page and each with a page of its own.' },
      { t: 'Lead capture forms', d: 'Contact, quote request, booking and newsletter forms. Every submission is stored as an entry, not only emailed.' },
      { t: 'Contacts and pipeline', d: 'Leads go into the built-in CRM with a tag for each pipeline stage, so you can see who is new, who has a quote and who has said yes.' },
      { t: 'Email follow-up', d: 'Welcome emails, quote follow-ups and newsletters sent to lists and saved segments, with double opt-in and unsubscribe links.' },
      { t: 'Search engine ready', d: 'Clean titles and descriptions, Open Graph tags, structured data and a sitemap from the SEO extension.' },
      { t: 'Privacy built in', d: 'Consent checkboxes on forms, and contacts covered by WordPress\'s own personal data export and erase tools.' }
    ],
    faq: [
      { q: 'Is the CRM website generator really free?', a: 'Yes. The generator, the Unyson+ plugin and theme, and the AI Dev Kit are free. You only pay for your own hosting and, if you use one, your AI agent subscription.' },
      { q: 'Do I need to know how to code?', a: 'No. You fill in a form and copy the result. Your AI agent does the building. After it is built, the site is edited in the WordPress admin with a visual page builder.' },
      { q: 'Which AI agents can use the prompt?', a: 'Any agent that can read files and run commands on the machine or server hosting WordPress, such as Claude Code, Cursor or Codex. Chat-only assistants can follow the plan, but you will have to carry out the steps yourself.' },
      { q: 'Is the result a WordPress site?', a: 'Yes. It is a normal WordPress site built with the free Unyson+ framework, so you own it, can host it anywhere and can edit everything in the admin.' },
      { q: 'My industry is not listed. Can I still use it?', a: 'Yes. This page works for any business that runs on enquiries, quotes or bookings. Describe what you do in the form and the agent builds around it. Presets for more industries are on the roadmap.' }
    ]
  },

  business: {
    types: [
      { value: 'solo', label: 'Self-employed', promptLabel: 'self-employed' },
      { value: 'team', label: 'Small team', promptLabel: 'small team', selected: true },
      { value: 'company', label: 'Company', promptLabel: 'company' }
    ],
    namePlaceholder: 'Northwind Solar',
    marketLabel: 'Area served',
    marketPlaceholder: 'Leeds and West Yorkshire',
    marketAsk: 'the area I serve',
    taglinePlaceholder: 'Solar panels, fitted in a day',
    fields: [
      { name: 'describe', label: 'What does your business do?', textarea: true, required: true, ask: 'a short description of what my business does', placeholder: 'We design and install solar panels and home batteries for homeowners, and service existing systems.' }
    ],
    toSpec: function (s) { return { description: s.describe || '[What the business does]' }; }
  },

  audience: {
    legend: 'Who your customers are',
    fallback: 'individuals and businesses',
    options: [
      { value: 'individuals', label: 'Individuals', checked: true },
      { value: 'businesses', label: 'Businesses' },
      { value: 'local', label: 'Local area only', list: 'Local customers' },
      { value: 'online', label: 'Anywhere online', list: 'Online customers' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with the main service and a lead form call to action, services overview, why choose us, client stories, call to action.', required: true },
    { id: 'services', title: 'Services', purpose: 'All services, each linking to its own page.', on: true },
    { id: 'about', title: 'About', purpose: 'Story, experience and credentials.', on: true },
    { id: 'team', title: 'Our team', purpose: 'Team members with photos and roles.', type: ['team', 'company'] },
    { id: 'work', title: 'Our work', purpose: 'Case studies or a gallery of past projects.' },
    { id: 'stories', title: 'Client stories', purpose: 'Testimonials from customers.', on: true },
    { id: 'pricing', title: 'Pricing', purpose: 'Packages or starting prices, with a quote request call to action.' },
    { id: 'faq', title: 'FAQ', purpose: 'Answers to the questions customers ask most.', on: true },
    { id: 'blog', title: 'Blog', purpose: 'Articles and guides (good for search traffic).' },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, address and map.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How lead data is collected, stored and used.', required: true }
  ],

  content: {
    legend: 'Services',
    specKey: 'services',
    includedText: 'Always included: a page per service with a summary, a starting price and an icon.',
    extrasLabel: 'Extra service details',
    extras: [
      { value: 'duration', label: 'Duration', key: 'service_duration', type: 'text' },
      { value: 'gallery', label: 'Photo gallery', checked: true, key: 'service_gallery', type: 'gallery' },
      { value: 'service_area', label: 'Service area', key: 'service_area', type: 'text' },
      { value: 'booking_link', label: 'Booking link', key: 'service_booking_url', type: 'url' },
      { value: 'faq', label: 'Questions per service', key: 'service_faq', type: 'list' }
    ],
    samples: { label: 'Services to draft from your description', options: [0, 3, 6], selected: 3 },

    toSpec: function (s) {
      var extra = this.extras.filter(function (x) { return s.extras.indexOf(x.value) !== -1; });
      return {
        source: 'manual',
        post_type: {
          blueprint: 'services',
          key: 'service',
          archive_slug: 'services',
          base_fields: ['service_summary', 'service_price', 'service_icon'],
          extra_fields: extra.map(function (f) { return { label: f.label, key: f.key, type: f.type }; }),
          draft_services: parseInt(s.samples, 10) || 0
        }
      };
    },

    promptLines: function (S) {
      var pt = S.post_type;
      var out = [];
      out.push('Go to **Unyson+ → Post Types → Blueprints** and install **Services**. It creates the `service` post type (archive at `/services/`, page builder enabled) with a "Service Details" field group: short summary, price from, and icon.');
      if (pt.extra_fields.length) {
        out.push('Add these fields to the Service Details group with the Custom Fields extension:');
        pt.extra_fields.forEach(function (f) { out.push('- ' + f.label + ': key `' + f.key + '`, type `' + f.type + '`'); });
      }
      out.push('- **Services page:** list every service with the `posts` element (post type `service`), showing the icon, title, summary and starting price. Check `docs/shortcodes/posts.md` for the exact options.');
      out.push('- **Single service layout:** what it is, who it is for, what is included, the starting price, ' + (pt.extra_fields.length ? 'the extra details above, ' : '') + 'client stories, and the quote or booking form. Look up in the kit how to build a reusable single-post layout from the dynamic post elements.');
      if (pt.draft_services) out.push('- Draft ' + pt.draft_services + ' services from the business description, as drafts for me to review. Put "Draft" at the start of each title, keep claims general, and leave prices as [Add your price].');
      else out.push('- Do not create services; I will add my own.');
      return out;
    }
  },

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'quote', title: 'Quote request', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Service (choice of your services)', 'Details', 'When do you need it?'], where: 'Home page, Services page and every single service page', on: true },
    { id: 'booking', title: 'Book an appointment', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Service', 'Preferred date (date)', 'Message'], where: 'Single service pages and the Contact page' },
    { id: 'callback', title: 'Request a callback', starter: 'Contact', fields: ['Name', 'Phone', 'Best time to call'], where: 'Site header button and the home page' },
    { id: 'newsletter', title: 'Newsletter signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive emails'], where: 'Footer and blog sidebar', on: true }
  ],

  stages: ['New lead', 'Contacted', 'Quote sent', 'Follow-up', 'Won', 'Lost'],

  emails: [
    { value: 'welcome', label: 'Welcome email', checked: true, description: 'Welcome email sent when someone confirms their subscription' },
    { value: 'quote_followup', label: 'Quote follow-up', checked: true, description: 'Follow-up for quote requests that have not replied (campaign template)' },
    { value: 'newsletter', label: 'Monthly newsletter', description: 'Monthly newsletter with news and tips (campaign template)' },
    { value: 'review_request', label: 'Review request', description: 'Request for a review after a job is done (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: '[main service]' + (s.market ? ' ' + s.market : ''), schema: ['LocalBusiness'], local: s.audience.indexOf('online') === -1 };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target the main service plus the area served ("' + spec.seo.primary_keyword + '", with the real service name) on the home page, and each service name on its own page. Use ' + spec.seo.schema.join(' and ') + ' structured data for the business.';
    }
  },

  compliance: {
    toSpec: function () { return { privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: business name (' + b.name + '), contact details, opening hours if any, and a link to the privacy policy.';
    }
  },

  prepare: function (s) {
    var out = ['Photos of your work, team or premises'];
    if (s.businessType !== 'solo') out.push('Team photos and roles');
    out.push('A few real customer reviews you can quote');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete business website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- What it does: ' + b.description, '- Area served: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      return out;
    },
    needs: function () { return 'photos, logo, real services and prices, customer reviews, copy to review'; },
    editWhat: 'services, forms and leads',
    placeholderExample: 'Add your customer count',
    pluginRule: 'Do not add third-party plugins unless I ask.'
  }
});
