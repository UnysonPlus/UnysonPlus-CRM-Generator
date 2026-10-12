/* Venue preset: wedding venues, event and party venues, conference venues. */
CRMGEN.register({
  id: 'venue',
  path: '/event-venue-crm-website/',
  label: 'Event venue and weddings',

  page: {
    title: 'Free Event and Wedding Venue CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for a wedding or event venue on WordPress: spaces, packages, date availability enquiries, tour bookings, a brochure download and an enquiry-to-booking pipeline. Copy the prompt for your AI agent.',
    h1: 'Free event and wedding venue CRM website for WordPress',
    lede: 'Your spaces, packages and gallery, with date availability enquiries, venue tours and a pipeline from first enquiry to deposit paid. For wedding, party and conference venues, built on the free Unyson+ framework.',
    note: 'Works alongside the venue management software you already use.',
    ogAlt: 'The event venue CRM website generator: spaces, enquiries and bookings',
    genTitle: 'Build your venue CRM website spec',
    schemaName: 'Free Event and Wedding Venue CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Spaces', d: 'A page for each room or outdoor space with capacities, layouts, a floor plan and photos.' },
      { t: 'Date availability enquiries', d: 'People give their date, guest count and budget up front, so you can reply with a real offer.' },
      { t: 'Venue tours', d: 'A tour booking form, because most bookings are decided on a visit.' },
      { t: 'Enquiry pipeline', d: 'Enquiries move from contacted, to tour booked, proposal sent, provisional hold and deposit paid.' },
      { t: 'Brochure download', d: 'Visitors leave their email to get your brochure, which turns browsers into leads you can follow up.' },
      { t: 'Follow-up emails', d: 'Follow-ups for enquiries and tours that have not booked, and open day invitations, saved as drafts.' }
    ],
    faq: [
      { q: 'Does it work with my venue management software?', a: 'Yes. Choose it in the form and the agent adds its enquiry form or availability calendar where it fits, and keeps the site\'s own enquiry form so every lead also reaches the built-in CRM.' },
      { q: 'Can visitors see which dates are free?', a: 'If your venue software has an availability calendar, the agent embeds it. Otherwise the availability form collects the date, and you reply with what is free.' }
    ]
  },

  business: {
    types: [
      { value: 'wedding', label: 'Wedding venue', promptLabel: 'wedding venue', selected: true },
      { value: 'events', label: 'Event and party venue', promptLabel: 'event and party venue' },
      { value: 'conference', label: 'Conference venue', promptLabel: 'conference and meeting venue' }
    ],
    namePlaceholder: 'Thornbury Barn',
    marketLabel: 'Location',
    marketPlaceholder: 'The Cotswolds',
    marketAsk: 'where the venue is',
    taglinePlaceholder: 'A restored barn for weddings and celebrations',
    fields: [
      { name: 'capacity', label: 'Maximum guests', hint: 'optional' },
      { name: 'phone', label: 'Phone number', hint: 'optional' }
    ],
    toSpec: function (s) { return { max_guests: s.capacity || null, phone: s.phone || null }; }
  },

  audience: {
    legend: 'Events you host',
    fallback: 'weddings and private events',
    options: [
      { value: 'weddings', label: 'Weddings', checked: true, list: 'Couples' },
      { value: 'parties', label: 'Private parties', checked: true, list: 'Private parties' },
      { value: 'corporate', label: 'Corporate events', list: 'Corporate' },
      { value: 'community', label: 'Charity and community', list: 'Community' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with a strong photo and a "Check availability" button; spaces; the events hosted; gallery; reviews; how to visit.', required: true },
    { id: 'spaces', title: 'Spaces', purpose: 'All spaces with capacities, each linking to its own page.', on: true },
    { id: 'weddings', title: 'Weddings', purpose: 'Wedding packages, ceremonies and receptions, with the availability form.', audience: 'weddings' },
    { id: 'parties', title: 'Private parties', purpose: 'Birthdays, anniversaries and celebrations, with the availability form.', audience: 'parties' },
    { id: 'corporate', title: 'Corporate events', purpose: 'Meetings, conferences, launches and away days, with the availability form.', audience: 'corporate' },
    { id: 'packages', title: 'Packages and pricing', purpose: 'Packages with what is included and starting prices, and the brochure download.', on: true },
    { id: 'gallery', title: 'Gallery', purpose: 'Photos of the venue and real events.', on: true },
    { id: 'suppliers', title: 'Recommended suppliers', purpose: 'Caterers, florists, photographers and others you work with.' },
    { id: 'reviews', title: 'Reviews', purpose: 'Reviews from couples and event hosts.', on: true },
    { id: 'availability', title: 'Check availability', purpose: 'The availability form, or the availability calendar from the venue software.', on: true },
    { id: 'faq', title: 'FAQ', purpose: 'Capacity, catering, music, curfew, accommodation, parking and accessibility.', on: true },
    { id: 'terms', title: 'Booking terms', purpose: 'Provisional holds, deposits, payment schedule and cancellations.', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, address, map and directions.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How enquiry data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Spaces',
    specKey: 'spaces',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      rename: { singular: 'Space', plural: 'Spaces', slug: 'spaces' },
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Spaces', singleName: 'space',
      listing: 'list every space with the `posts` element (post type `service`), showing a large photo, the title, capacity and summary.',
      single: 'a large gallery, capacities for each layout, the floor plan, what the space suits, what is included, the virtual tour, reviews, and the availability form.'
    },
    secondary: [
      { blueprint: 'Events', extra: 'open_days', purpose: 'use it for open days, wedding fairs and tastings, and show upcoming ones on the home page and the Weddings page.' },
      { blueprint: 'Downloads', extra: 'brochure', purpose: 'add the venue brochure as a download with "Requires an email address" switched on, and offer it on the Packages page so each download becomes a lead.' }
    ],
    includedText: 'Always included: a page per space with a summary, a starting price and an icon.',
    extrasLabel: 'Extra space details',
    extras: [
      { value: 'capacity', label: 'Capacity by layout', checked: true, key: 'service_capacity', type: 'text' },
      { value: 'gallery', label: 'Photo gallery', checked: true, key: 'service_gallery', type: 'gallery' },
      { value: 'floorplan', label: 'Floor plan', key: 'service_floor_plan', type: 'file' },
      { value: 'tour', label: 'Virtual tour', key: 'service_tour', type: 'oembed' },
      { value: 'layout', label: 'Layouts', taxonomy: 'space_layout', terms: ['Ceremony', 'Banquet', 'Reception', 'Theatre', 'Classroom'] },
      { value: 'brochure', label: 'Brochure download', checked: true },
      { value: 'open_days', label: 'Open days and tastings' }
    ],
    samples: { label: 'Spaces to draft', options: [0, 1, 2, 3, 4], selected: 2, noun: 'spaces' },
    provider: {
      label: 'Venue management software',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Tripleseat', 'Perfect Venue', 'Planning Pod', 'Other'],
      hint: 'Optional. If it has an enquiry form or availability calendar, the agent adds it.',
      specKey: 'venue_software',
      promptLabel: 'Venue software',
      prompt: 'ask me for the enquiry form or availability calendar embed from my account, and add it to the Check availability page. Keep our availability form as well so every enquiry also reaches the CRM. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'availability', title: 'Check availability', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Event type (choice)', 'Preferred date (date)', 'Flexible on dates? (yes / no)', 'Number of guests (number)', 'Budget range (choice)', 'Message'], where: 'Check availability page, every space page and the event pages', on: true },
    { id: 'tour', title: 'Book a venue tour', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Preferred date (date)', 'Event type (choice)', 'Event date if known (date)'], where: 'Home page, Spaces page and Weddings page', on: true },
    { id: 'brochure', title: 'Get the brochure', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Event type (choice)', 'Consent to receive emails'], where: 'Packages and pricing page', on: true }
  ],

  stages: ['Enquiry', 'Contacted', 'Tour booked', 'Proposal sent', 'Provisional hold', 'Deposit paid', 'Event done', 'Lost'],

  emails: [
    { value: 'enquiry_followup', label: 'Enquiry follow-up', checked: true, description: 'Follow-up for enquiries that have not booked a tour (campaign template)' },
    { value: 'tour_followup', label: 'Tour follow-up', checked: true, description: 'Follow-up after a venue tour with the proposal and next steps (campaign template)' },
    { value: 'welcome', label: 'Brochure welcome email', description: 'Welcome email with the brochure link for people who confirmed their subscription' },
    { value: 'open_day', label: 'Open day invitation', description: 'Invitation to the next open day or tasting (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      var word = { wedding: 'wedding venue', events: 'event venue', conference: 'conference venue' }[s.businessType] || 'event venue';
      return { primary_keyword: word + (s.market ? ' ' + s.market : ''), schema: ['EventVenue'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" on the home page and the event type plus location on each event page. Use EventVenue structured data with the address, capacity and photos.';
    }
  },

  compliance: {
    toSpec: function () { return { booking_terms: true, claims_confirmed_by_owner: true, photo_consent: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: venue name, address, phone, how to visit, and links to the booking terms and privacy policy.';
    },
    extraLines: function () {
      return [
        'Only state capacities, licences (alcohol, music, ceremonies), curfews and accessibility details that I confirm.',
        'Only publish photos of real events that I confirm the hosts agreed to share.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Professional photos of the venue', 'Capacities and floor plans', 'Packages and starting prices'];
    if (s.extras.indexOf('brochure') !== -1) out.push('Your brochure as a PDF');
    if (s.provider) out.push('Your ' + s.provider + ' account details');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build an event venue CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete event venue website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Location: ' + b.market];
      if (b.max_guests) out.push('- Maximum guests: ' + b.max_guests);
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone);
      return out;
    },
    needs: function () { return 'photos, logo, capacities and floor plans, packages and prices, brochure, reviews, copy to review'; },
    editWhat: 'spaces, packages, enquiries and leads',
    placeholderExample: 'Add the number of weddings hosted',
    pluginRule: 'The only third-party addition allowed is the venue software\'s embed, if one is chosen.'
  }
});
