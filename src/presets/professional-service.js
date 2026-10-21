/* Professional service preset: consultancies, accountants, architects, agencies and independent
   specialists — businesses sold on JUDGEMENT, where the buyer is choosing a firm rather than a product.
   Modelled on the law-firm preset, which is the nearest shape, minus the bar-advertising rules and plus
   the two things that distinguish this category: credentials and case studies, both of which are
   checkable claims the owner has to supply. See docs/site-creator/verticals/professional-service.md in
   the AI Dev Kit for the vertical template this follows. */
CRMGEN.register({
  id: 'professional-service',
  path: '/crm/professional-service/',
  label: 'Professional service',
  heroStages: ['Enquiry', 'Proposal', 'Client'],

  page: {
    title: 'Free Professional Services CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for a consultancy, accountancy, architecture practice or agency on WordPress: services, credentials, case studies, enquiry forms and a client pipeline. Copy the prompt for your AI agent.',
    h1: 'Free professional services CRM website for WordPress',
    lede: 'Your services, how you work, the credentials that matter and the enquiries they bring in — with a pipeline from first contact to signed client. For consultancies, accountants, architects, engineers and agencies, on the free Unyson+ framework.',
    note: 'Sold on judgement, not on price. The site has to earn trust before it asks for anything.',
    ogAlt: 'The professional services CRM website generator: services, credentials and an enquiry pipeline',
    genTitle: 'Build your professional services website spec',
    schemaName: 'Free Professional Services CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'A page per service', d: 'The problem it solves, how the engagement runs, and what it costs to start — the three things a buyer wants before they enquire.' },
      { t: 'How you work', d: 'Your method, step by step. The page that separates a firm with a process from one with a rate card.' },
      { t: 'Credentials', d: 'Qualifications, registrations and memberships — exactly the ones you give us, never implied.' },
      { t: 'Case studies', d: 'Selected work, published only where the client agreed to be named.' },
      { t: 'Enquiry pipeline', d: 'From first contact through proposal to signed client, so nothing sits unanswered.' },
      { t: 'Insights', d: 'Articles that make the case for your expertise — the long game for a service sold on it.' }
    ],
    faq: [
      { q: 'Can it publish my case studies?', a: 'Yes, and the prompt tells the agent to publish only the ones you confirm the client agreed to be named in. Where you have no supplied case studies, it leaves the page out rather than writing something plausible.' },
      { q: 'What about my qualifications?', a: 'They go in exactly as you give them. The agent is told never to add, imply or upgrade a credential — a lapsed membership stated as current is a real problem, not a typo.' }
    ]
  },

  business: {
    types: [
      { value: 'consultancy', label: 'Consultancy', promptLabel: 'consultancy', selected: true },
      { value: 'accountancy', label: 'Accountancy or bookkeeping', promptLabel: 'accountancy practice' },
      { value: 'architecture', label: 'Architecture or engineering', promptLabel: 'architecture practice' },
      { value: 'agency', label: 'Agency (design, marketing, digital)', promptLabel: 'agency' },
      { value: 'specialist', label: 'Independent specialist', promptLabel: 'independent practice' }
    ],
    namePlaceholder: 'Marwood & Finch',
    marketLabel: 'Town or city',
    marketPlaceholder: 'Leeds',
    marketAsk: 'the town or city the practice is based in',
    taglinePlaceholder: 'Clear advice for complicated decisions',
    fields: [
      { name: 'phone', label: 'Phone number', hint: 'for click-to-call' },
      { name: 'credentials', label: 'Qualifications or memberships', hint: 'optional; only ones that are current' }
    ],
    toSpec: function (s) { return { phone: s.phone || null, credentials: s.credentials || null }; }
  },

  audience: {
    legend: 'Who you work with',
    fallback: 'small and medium businesses',
    options: [
      { value: 'smb', label: 'Small and medium businesses', checked: true, list: 'SMB clients' },
      { value: 'corporate', label: 'Corporate or enterprise', list: 'Corporate clients' },
      { value: 'public', label: 'Public sector', list: 'Public sector' },
      { value: 'private', label: 'Private individuals', list: 'Private clients' },
      { value: 'startup', label: 'Startups and founders', list: 'Startups' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'What the firm does, for whom, and the one next step. Credibility before detail.', required: true },
    { id: 'services', title: 'Services', purpose: 'Every service, with the problem it solves and how an engagement runs.', on: true },
    { id: 'approach', title: 'How we work', purpose: 'The method, step by step, and what the client is expected to do at each stage.', on: true },
    { id: 'work', title: 'Work', purpose: 'Case studies or sectors served, published only where the client agreed to be named.', on: true },
    { id: 'team', title: 'Team', purpose: 'The people, with the qualifications that matter in this field.', on: true },
    { id: 'insights', title: 'Insights', purpose: 'Articles and guides. The long game for a service sold on expertise.', on: true },
    { id: 'pricing', title: 'Pricing', purpose: 'How you price — fixed, day rate, retainer, or on application.' },
    { id: 'faq', title: 'FAQ', purpose: 'Scope, timescales, how engagements start and what happens if they change.', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Enquiry form, direct contacts, offices and response time.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How enquiry and client data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Services',
    specKey: 'services',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      rename: { singular: 'Service', plural: 'Services', slug: 'services' },
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Services', singleName: 'service',
      listing: 'list every service with the `posts` element (post type `service`), showing the icon, title and summary. Leave the price field empty unless I give a figure.',
      single: 'who the service is for, the problem it solves, how the engagement runs step by step, what the client needs to provide, who leads it, common questions, and the enquiry form.'
    },
    secondary: [
      { blueprint: 'Team Members', purpose: 'add each person with job title, short bio and photo, and put their qualifications in the bio exactly as I give them.' },
      { blueprint: 'Case Studies', extra: 'results', purpose: 'use it for selected engagements. Publish ONLY the ones I confirm the client agreed to be named in; if I supply none, leave the Work page out entirely.' }
    ],
    includedText: 'Always included: a page per service and a Team section for profiles.',
    extrasLabel: 'Extra service details',
    extras: [
      { value: 'faq', label: 'Questions per service', checked: true, key: 'service_faq', type: 'list' },
      { value: 'process', label: 'Engagement steps', checked: true, key: 'service_process', type: 'list' },
      { value: 'pricing', label: 'How it is priced', key: 'service_pricing', type: 'text' },
      { value: 'sectors', label: 'Sectors served', key: 'service_sectors', type: 'text' },
      { value: 'results', label: 'Case studies section' }
    ],
    samples: { label: 'Services to draft', options: [0, 3, 6], selected: 3, noun: 'service pages' },
    provider: {
      label: 'Proposal or practice management software',
      when: [''],
      placeholder: 'None / not sure',
      options: ['HubSpot', 'Pipedrive', 'Practice Ignition', 'Karbon', 'Other'],
      hint: 'Optional. If it accepts web form submissions, enquiries are sent there too.',
      specKey: 'practice_software',
      promptLabel: 'Practice software',
      prompt: 'ask me how my account receives web enquiries (an embed, a webhook or an email address). If it can, send each enquiry there as well as to the CRM; if not, keep our form and tell me. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Organisation', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'enquiry', title: 'Enquiry', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Organisation', 'Service (choice)', 'What you need help with', 'Timescale'], where: 'Every service page and the home page', on: true },
    { id: 'consult', title: 'Book a consultation', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Organisation', 'Preferred time', 'Context'], where: 'Home page and the Services page', on: true },
    { id: 'insights', title: 'Insights signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive emails'], where: 'Footer and the Insights page', on: true, list: 'SMB clients' }
  ],

  stages: ['New enquiry', 'Qualified', 'Consultation booked', 'Proposal sent', 'Won', 'Delivering', 'Past client', 'Declined'],

  emails: [
    { value: 'welcome', description: 'A welcome email to new enquiries with what happens next and how long a reply takes.' },
    { value: 'proposal', description: 'A follow-up a few days after a proposal is sent, offering to talk it through.' },
    { value: 'insights', description: 'The Insights newsletter to subscribers who opted in.' },
    { value: 'past', description: 'A check-in to past clients, which is where repeat work in this category actually comes from.' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: '[service]' + (s.market ? ' ' + s.market : ''), schema: ['ProfessionalService'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" (with the main service) on the home page and each service plus the city on its own page. Use ProfessionalService structured data for the firm, filled only from details I supply.';
    }
  },

  compliance: {
    toSpec: function () { return { credentials_as_supplied: true, named_case_studies_only: true, no_outcome_promises: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: firm name, address, phone, ' + (b.credentials ? 'the registrations I gave (' + b.credentials + '), ' : 'any professional registrations (ask me — do not assume any), ') + 'and links to the privacy policy.';
    },
    extraLines: function () {
      return [
        'Credentials, registrations and memberships go in exactly as I give them. Never add, imply or upgrade one — a lapsed membership stated as current is a real problem, not a typo. If I give none, the site has no credentials block.',
        'Publish a case study only where I confirm the client agreed to be named. If I supply none, leave the Work page out rather than writing an anonymised one.',
        'Do not promise outcomes or use "best", "leading" or "guaranteed" about the firm unless I supply the wording.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Team photos, bios and current qualifications', 'Case studies the client agreed to be named in', 'How you price each service'];
    if (s.provider) out.push('Your ' + s.provider + ' account details');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a professional services CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete professional services website',
    extensionsText: 'Post Types, Custom Fields, Forms, CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Services: ' + b.services, '- Location: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone + ' (show it in the header as a click-to-call link)');
      if (b.credentials) out.push('- Credentials: ' + b.credentials + ' (use exactly this wording)');
      return out;
    },
    needs: function () { return 'team photos and bios, current qualifications, case studies the client agreed to be named in, how each service is priced'; },
    editWhat: 'services, enquiries and leads',
    placeholderExample: 'Add the year the practice was founded',
    pluginRule: 'The only third-party addition allowed is the practice software\'s embed, if one is chosen.',
    rules: ['Write Insights articles as general guidance, never as advice for a specific client situation, and end each with a call to enquire.']
  }
});
