/* Home services preset: plumbers, electricians, roofers, HVAC, cleaners, landscapers. */
CRMGEN.register({
  id: 'home-services',
  path: '/crm/home-services/',
  label: 'Home services',
  heroStages: ['New', 'Quoted', 'Won'],

  page: {
    title: 'Free Home Services CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for plumbers, electricians, roofers, HVAC and cleaning companies on WordPress: quote requests, service areas, job photos and a lead pipeline. Copy the prompt for your AI agent.',
    h1: 'Free home services CRM website for WordPress',
    lede: 'Quote requests with photos, service area pages, recent jobs and a pipeline from first call to finished job. Built for plumbers, electricians, roofers, HVAC, cleaning and landscaping companies, on the free Unyson+ framework.',
    note: 'Works alongside the scheduling or quoting software you already use.',
    ogAlt: 'The home services CRM website generator: quote requests and a job pipeline',
    genTitle: 'Build your home services CRM website spec',
    schemaName: 'Free Home Services CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Service pages', d: 'A page for each service with what is included, a starting price and job photos, plus one page listing them all.' },
      { t: 'Quote requests with photos', d: 'Customers describe the job, add photos and give their postcode or ZIP, so you can price it before you visit.' },
      { t: 'Areas you cover', d: 'A page for each town or district you serve, which is how local customers search.' },
      { t: 'Job pipeline', d: 'Every lead moves from new, to site visit, to quote sent, to won and job complete, with a review request at the end.' },
      { t: 'Follow-up emails', d: 'Quote follow-ups, review requests and seasonal maintenance reminders, written in your voice and saved as drafts.' },
      { t: 'Click-to-call everywhere', d: 'Your phone number in the header and a callback request form, because many customers would rather talk.' }
    ],
    faq: [
      { q: 'Does it work with my scheduling or quoting software?', a: 'Yes. Pick it in the form and the agent adds that software\'s booking or request widget next to the site\'s own quote form. Your website form still feeds the built-in CRM, so no lead is lost if the widget changes.' },
      { q: 'Can customers send photos of the job?', a: 'Yes. The quote request form has a photo upload, and every submission is stored as an entry you can open in WordPress.' }
    ]
  },

  business: {
    types: [
      { value: 'solo', label: 'Owner-operator', promptLabel: 'owner-operator' },
      { value: 'team', label: 'Small crew', promptLabel: 'small team', selected: true },
      { value: 'company', label: 'Company with several crews', promptLabel: 'company with several crews' }
    ],
    namePlaceholder: 'Brightwater Plumbing',
    marketLabel: 'Areas covered',
    marketPlaceholder: 'Denver and the Front Range',
    marketAsk: 'the areas I cover',
    taglinePlaceholder: 'Same-day plumbing repairs',
    fields: [
      { name: 'trades', label: 'Main services', textarea: true, required: true, ask: 'my main services', placeholder: 'Leak and drain repairs, water heater installation, bathroom remodels, 24/7 emergency call-outs.' },
      { name: 'phone', label: 'Phone number', hint: 'for click-to-call' },
      { name: 'license', label: 'License or registration number', hint: 'optional' }
    ],
    toSpec: function (s) { return { services_offered: s.trades || '[Main services]', phone: s.phone || null, license_number: s.license || null }; }
  },

  audience: {
    legend: 'Who your customers are',
    fallback: 'homeowners',
    options: [
      { value: 'homeowners', label: 'Homeowners', checked: true },
      { value: 'landlords', label: 'Landlords and property managers', list: 'Landlords' },
      { value: 'commercial', label: 'Businesses', list: 'Commercial customers' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with the main service, the area covered, a phone button and the quote form; services; recent jobs; reviews; areas covered.', required: true },
    { id: 'services', title: 'Services', purpose: 'All services, each linking to its own page.', on: true },
    { id: 'areas', title: 'Areas we cover', purpose: 'The towns or districts served, each linking to its own area page.', on: true },
    { id: 'jobs', title: 'Recent jobs', purpose: 'A gallery of finished jobs with short descriptions.', on: true },
    { id: 'reviews', title: 'Reviews', purpose: 'Customer reviews.', on: true },
    { id: 'about', title: 'About', purpose: 'Story, team and credentials.', on: true },
    { id: 'emergency', title: 'Emergency service', purpose: 'Out-of-hours call-outs, with the phone number first and a callback form.' },
    { id: 'landlords', title: 'Landlords', purpose: 'Services for landlords and property managers, with the quote form.', audience: 'landlords' },
    { id: 'commercial', title: 'Commercial', purpose: 'Services for businesses, with the quote form.', audience: 'commercial' },
    { id: 'faq', title: 'FAQ', purpose: 'Pricing, call-out times, guarantees and how quotes work.', on: true },
    { id: 'blog', title: 'Tips and guides', purpose: 'Maintenance tips and how-to guides (good for search traffic).' },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, hours and areas covered.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How lead data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Services',
    specKey: 'services',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Services', singleName: 'service',
      listing: 'list every service with the `posts` element (post type `service`), showing the icon, title, summary and starting price.',
      single: 'what the service covers, the starting price, job photos, common questions, reviews, and the quote request form.'
    },
    secondary: [
      { blueprint: 'Locations', extra: 'area_pages', purpose: 'create one location per town or district I cover (address and map optional), and link them from the "Areas we cover" page.' }
    ],
    includedText: 'Always included: a page per service with a summary, a starting price and an icon.',
    extrasLabel: 'Extra service details',
    extras: [
      { value: 'gallery', label: 'Job photos', checked: true, key: 'service_gallery', type: 'gallery' },
      { value: 'faq', label: 'Questions per service', checked: true, key: 'service_faq', type: 'list' },
      { value: 'guarantee', label: 'Guarantee or warranty', key: 'service_guarantee', type: 'text' },
      { value: 'callout_fee', label: 'Call-out fee', key: 'service_callout_fee', type: 'text' },
      { value: 'area_pages', label: 'A page per area covered' }
    ],
    samples: { label: 'Services to draft', options: [0, 3, 6], selected: 3, noun: 'services' },
    provider: {
      label: 'Scheduling or quoting software',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Jobber', 'Housecall Pro', 'ServiceTitan', 'Workiz', 'Other'],
      hint: 'Optional. If you use one, the agent adds its booking or request widget next to the site\'s own quote form.',
      specKey: 'scheduling_software',
      promptLabel: 'Online booking',
      prompt: 'ask me for the booking or request widget from my account and add it to the Contact page and every service page, next to our own quote form. Keep our form: it feeds the CRM. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'quote', title: 'Request a quote', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Postcode or ZIP', 'Service needed (choice of your services)', 'Describe the job', 'Photos (file upload, optional)', 'Preferred visit date (date)'], where: 'Home page, every service page and the Contact page', on: true },
    { id: 'callback', title: 'Request a callback', starter: 'Contact', fields: ['Name', 'Phone', 'Best time to call'], where: 'Site header button and the Emergency service page', on: true },
    { id: 'reminders', title: 'Maintenance reminders signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive reminder emails'], where: 'Footer and the Tips and guides page' }
  ],

  stages: ['New lead', 'Contacted', 'Site visit booked', 'Quote sent', 'Won', 'Job complete', 'Review requested', 'Lost'],

  emails: [
    { value: 'quote_followup', label: 'Quote follow-up', checked: true, description: 'Follow-up for quotes that have not been accepted (campaign template)' },
    { value: 'review_request', label: 'Review request', checked: true, description: 'Request for a review after a job is complete (campaign template)' },
    { value: 'maintenance', label: 'Seasonal reminders', description: 'Seasonal maintenance reminder (campaign template)' },
    { value: 'welcome', label: 'Welcome email', description: 'Welcome email sent when someone confirms their subscription' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: '[main service]' + (s.market ? ' ' + s.market : ''), schema: ['HomeAndConstructionBusiness'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target the main service plus the area ("' + spec.seo.primary_keyword + '", with the real service name) on the home page, each service on its own page, and each town on its area page. Use HomeAndConstructionBusiness structured data, or the closest subtype (Plumber, Electrician, RoofingContractor, HVACBusiness, HousePainter, Locksmith), with the areas served.';
    }
  },

  compliance: {
    toSpec: function () { return { license_in_footer: true, claims_confirmed_by_owner: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: business name, phone number as a click-to-call link, ' + (b.license_number ? 'license number (' + b.license_number + '), ' : 'license or registration number (ask me), ') + 'areas covered, and a link to the privacy policy.';
    },
    extraLines: function () {
      return ['Do not describe the business as licensed, insured, certified or guaranteed unless I confirm it. Leave [Confirm: insured?] style placeholders instead.'];
    }
  },

  prepare: function (s) {
    var out = ['Photos of real jobs, ideally before and after'];
    if (s.businessType !== 'solo') out.push('Team or van photos');
    out.push('Starting prices for your main services');
    if (s.provider) out.push('Your ' + s.provider + ' login');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a home services CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete home services website',
    extensionsText: 'Post Types, Custom Fields, Forms, CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Main services: ' + b.services_offered, '- Areas covered: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone + ' (show it in the header as a click-to-call link)');
      if (b.license_number) out.push('- License number: ' + b.license_number);
      return out;
    },
    needs: function () { return 'job photos, logo, real prices, reviews, copy to review'; },
    editWhat: 'services, quote requests and leads',
    placeholderExample: 'Add your years in business',
    pluginRule: 'The only third-party addition allowed is the scheduling software\'s widget, if one is chosen.'
  }
});
