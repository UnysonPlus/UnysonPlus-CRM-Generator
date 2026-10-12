/* Law firm preset: solo attorneys, small and mid-size firms. */
CRMGEN.register({
  id: 'law-firm',
  path: '/law-firm-crm-website/',
  label: 'Law firm',

  page: {
    title: 'Free Law Firm CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free law firm CRM website on WordPress: practice area pages, attorney profiles, consultation requests, legal guides and an intake pipeline, with the right disclaimers. Copy the prompt for your AI agent.',
    h1: 'Free law firm CRM website for WordPress',
    lede: 'Practice area pages, attorney profiles, consultation requests and an intake pipeline from first enquiry to retained client, with the disclaimers legal advertising needs. Built on the free Unyson+ framework.',
    note: 'Works with the intake or case management software you already use.',
    ogAlt: 'The law firm CRM website generator: practice areas and consultation requests',
    genTitle: 'Build your law firm CRM website spec',
    schemaName: 'Free Law Firm CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Practice area pages', d: 'A page for each practice area explaining who you help and how, with common questions and a consultation form.' },
      { t: 'Attorney profiles', d: 'Photos, bar admissions, experience and the practice areas each attorney handles.' },
      { t: 'Consultation requests', d: 'People describe their situation in general terms and choose a practice area, without sending anything confidential.' },
      { t: 'Intake pipeline', d: 'Enquiries move through conflict check, consultation, engagement letter and retained, so every lead gets a decision.' },
      { t: 'Legal guides', d: 'Articles that answer the questions clients search for, which is how most firms are found.' },
      { t: 'Disclaimers in place', d: 'An attorney advertising notice where required, a no attorney-client relationship notice on forms, and a past results disclaimer.' }
    ],
    callout: {
      title: 'A note on legal advertising rules',
      html: 'Lawyer advertising is regulated, and the rules differ by state and country. The prompt tells the agent to add the standard protections (an attorney advertising notice where required, a notice that contacting the firm does not create an attorney-client relationship, and a disclaimer that past results do not guarantee future outcomes), to avoid words like "expert" or "specialist" unless you confirm you may use them, and to list what you should check against your own bar\'s rules. It does not replace that check.'
    },
    faq: [
      { q: 'Does it work with my intake or case management software?', a: 'Yes. Choose it in the form and the agent connects the consultation form to it if the software accepts web form submissions, or tells you if it does not. Requests are also stored on your own site.' },
      { q: 'Will people send confidential details through the form?', a: 'The consultation form asks for a brief, general description and says clearly not to include confidential information, and that submitting it does not create an attorney-client relationship.' }
    ]
  },

  business: {
    types: [
      { value: 'solo', label: 'Solo attorney', promptLabel: 'solo attorney' },
      { value: 'small', label: 'Small firm', promptLabel: 'small firm', selected: true },
      { value: 'firm', label: 'Mid-size firm', promptLabel: 'mid-size firm' }
    ],
    namePlaceholder: 'Hartley & Moss LLP',
    marketLabel: 'City and state or country',
    marketPlaceholder: 'Chicago, Illinois',
    marketAsk: 'the city and state or country the firm practises in',
    taglinePlaceholder: 'Clear advice for families and small businesses',
    fields: [
      { name: 'areas', label: 'Practice areas', textarea: true, required: true, ask: 'the firm\'s practice areas', placeholder: 'Family law, wills and estates, real estate transactions, small business contracts.' },
      { name: 'phone', label: 'Phone number', hint: 'for click-to-call' },
      { name: 'bar', label: 'Bar or regulator number', hint: 'optional' }
    ],
    toSpec: function (s) { return { practice_areas: s.areas || '[Practice areas]', phone: s.phone || null, bar_number: s.bar || null }; }
  },

  audience: {
    legend: 'Who you represent',
    fallback: 'individuals and businesses',
    options: [
      { value: 'individuals', label: 'Individuals', checked: true },
      { value: 'families', label: 'Families' },
      { value: 'smallbiz', label: 'Small businesses', list: 'Small businesses' },
      { value: 'companies', label: 'Companies' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with who the firm helps and a "Request a consultation" button; practice areas; why clients choose the firm; attorneys; reviews where allowed.', required: true },
    { id: 'practice', title: 'Practice areas', purpose: 'All practice areas, each linking to its own page.', on: true },
    { id: 'attorneys', title: 'Our attorneys', purpose: 'Attorney profiles with photos, admissions and practice areas.', on: true },
    { id: 'consultation', title: 'Request a consultation', purpose: 'How consultations work, fees for them if any, and the consultation form.', on: true },
    { id: 'results', title: 'Case results', purpose: 'Selected outcomes, each with the past results disclaimer.' },
    { id: 'reviews', title: 'Client reviews', purpose: 'Client reviews, only where the bar\'s rules allow them.' },
    { id: 'about', title: 'About the firm', purpose: 'History, values and community work.', on: true },
    { id: 'guides', title: 'Legal guides', purpose: 'Articles answering common legal questions (good for search traffic). General information, not legal advice.', on: true },
    { id: 'faq', title: 'FAQ', purpose: 'Fees, how consultations work, what to bring.', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, office address and map.', required: true },
    { id: 'disclaimer', title: 'Disclaimer', purpose: 'Attorney advertising notice, no attorney-client relationship, past results, jurisdictions.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How enquiry data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Practice areas',
    specKey: 'practice_areas',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      rename: { singular: 'Practice area', plural: 'Practice areas', slug: 'practice-areas' },
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Practice areas', singleName: 'practice area',
      listing: 'list every practice area with the `posts` element (post type `service`), showing the icon, title and summary. Leave the price field empty unless I give a fixed fee.',
      single: 'who the practice area is for, the problems it solves, how the firm handles a matter step by step, the attorneys who practise it, common questions, and the consultation form.'
    },
    secondary: [
      { blueprint: 'Team Members', purpose: 'add each attorney with job title, short bio and photo for the "Our attorneys" page, and add their bar admissions to the bio.' },
      { blueprint: 'Case Studies', extra: 'results', purpose: 'use it for selected case results, and put the past results disclaimer on every result and on the listing page.' }
    ],
    includedText: 'Always included: a page per practice area and a Team section for attorney profiles.',
    extrasLabel: 'Extra practice area details',
    extras: [
      { value: 'faq', label: 'Questions per practice area', checked: true, key: 'service_faq', type: 'list' },
      { value: 'fees', label: 'Fee structure', key: 'service_fee_structure', type: 'text' },
      { value: 'jurisdictions', label: 'Jurisdictions', key: 'service_jurisdictions', type: 'text' },
      { value: 'results', label: 'Case results section' }
    ],
    samples: { label: 'Practice areas to draft', options: [0, 3, 6], selected: 3, noun: 'practice area pages' },
    provider: {
      label: 'Intake or case management software',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Clio Grow', 'Lawmatics', 'MyCase', 'PracticePanther', 'Other'],
      hint: 'Optional. If it accepts web form submissions, consultation requests are sent there too.',
      specKey: 'intake_software',
      promptLabel: 'Intake software',
      prompt: 'ask me how my account receives web enquiries (an embed, a webhook or an email address). If it can, send each consultation request there as well as to the CRM; if not, keep our form and tell me. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message', 'Acknowledgement: no attorney-client relationship, no confidential information (consent, terms)'], where: 'Contact page and footer call to action', required: true },
    { id: 'consultation', title: 'Request a consultation', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Practice area (choice)', 'Brief, general description of the matter', 'Preferred contact method', 'Acknowledgement: no attorney-client relationship, no confidential information (consent, terms)'], where: 'Request a consultation page, every practice area page and the home page', on: true },
    { id: 'callback', title: 'Request a callback', starter: 'Contact', fields: ['Name', 'Phone', 'Best time to call', 'Practice area (choice)'], where: 'Site header button' },
    { id: 'updates', title: 'Legal updates signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Topics of interest', 'Consent to receive emails'], where: 'Legal guides page and footer' }
  ],

  stages: ['New enquiry', 'Conflict check', 'Consultation booked', 'Consultation held', 'Engagement letter sent', 'Retained', 'Matter closed', 'Declined'],

  emails: [
    { value: 'consult_followup', label: 'Consultation follow-up', checked: true, description: 'Follow-up after a consultation, with next steps (campaign template)' },
    { value: 'welcome', label: 'Welcome email', description: 'Welcome email sent when someone confirms their subscription' },
    { value: 'updates', label: 'Legal updates newsletter', description: 'Periodic legal updates newsletter, general information only (campaign template)' },
    { value: 'review_request', label: 'Review request', description: 'Request for a review after a matter closes, where the bar allows it (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: '[practice area] lawyer' + (s.market ? ' ' + s.market : ''), schema: ['LegalService', 'Attorney'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" (with the main practice area) on the home page and each practice area plus the city on its own page. Use LegalService structured data for the firm and Attorney for each attorney profile.';
    }
  },

  compliance: {
    toSpec: function () { return { attorney_advertising_notice: true, no_relationship_notice_on_forms: true, past_results_disclaimer: true, avoid_specialist_claims: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: firm name, office address, phone, ' + (b.bar_number ? 'bar number (' + b.bar_number + '), ' : 'bar or regulator details (ask me), ') + 'an "Attorney advertising" notice where the jurisdiction requires it, and links to the Disclaimer and privacy policy.';
    },
    extraLines: function () {
      return [
        'Every form says that submitting it does not create an attorney-client relationship and asks people not to send confidential information.',
        'Do not use "expert", "specialist", "best" or similar words, or promise outcomes, unless I confirm the bar\'s rules allow it. Put the past results disclaimer next to any results or reviews.',
        'Give me a short list of what to check against my bar\'s advertising rules before launch.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Attorney headshots, bios and bar admissions', 'Reviews you are allowed to publish'];
    if (s.provider) out.push('Your ' + s.provider + ' account details');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a law firm CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete law firm website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Practice areas: ' + b.practice_areas, '- Location: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone + ' (show it in the header as a click-to-call link)');
      if (b.bar_number) out.push('- Bar number: ' + b.bar_number);
      return out;
    },
    needs: function () { return 'photos, logo, attorney bios, reviews you may publish, copy to review, a check against the bar\'s rules'; },
    editWhat: 'practice areas, consultation requests and leads',
    placeholderExample: 'Add the firm\'s founding year',
    pluginRule: 'The only third-party addition allowed is the intake software\'s embed, if one is chosen.',
    rules: ['Write legal guides as general information, never as advice for a specific situation, and end each with a call to book a consultation.']
  }
});
