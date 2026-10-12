/* Clinic preset: dental practices, medical clinics, therapy and specialist clinics. */
CRMGEN.register({
  id: 'clinic',
  path: '/dental-clinic-crm-website/',
  label: 'Dental or medical clinic',

  page: {
    title: 'Free Dental and Medical Clinic CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for a dental practice or medical clinic on WordPress: treatment pages, appointment requests, new patient information, recalls and a patient pipeline. Copy the prompt for your AI agent.',
    h1: 'Free dental and medical clinic CRM website for WordPress',
    lede: 'Treatment pages, appointment requests, new patient information and check-up reminders for dental practices, medical clinics and therapy clinics. Pick what you need and copy a prompt your AI agent builds on the free Unyson+ framework.',
    note: 'Works with the online booking system you already use. Forms never ask for health details.',
    ogAlt: 'The clinic CRM website generator: treatments, appointment requests and recalls',
    genTitle: 'Build your clinic CRM website spec',
    schemaName: 'Free Dental and Medical Clinic CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Treatment pages', d: 'A page for each treatment with what to expect, how long it takes, aftercare and fees, plus one page listing them all.' },
      { t: 'Appointment requests', d: 'New and existing patients request a time; your online booking widget sits alongside it if you use one.' },
      { t: 'New patient information', d: 'What to bring, how the first visit works, fees and insurance, so fewer people need to call.' },
      { t: 'Patient pipeline', d: 'Requests move from new, to booked, to attended, to recall due, so nobody falls through the gaps.' },
      { t: 'Recall and reminder emails', d: 'Check-up reminders and a welcome email for new patients, sent only to people who agreed to receive them.' },
      { t: 'Privacy first', d: 'Forms collect contact details and preferences only. Health information is never asked for online or stored in the CRM.' }
    ],
    callout: {
      title: 'A note on patient privacy',
      html: 'Website forms and email marketing tools are not the place for health information. Every form this generator plans asks only for contact details, the treatment someone is interested in and when they are free. The prompt tells the agent never to add questions about symptoms, conditions or medication, and to flag which privacy rules may apply to you (for example HIPAA in the United States or GDPR in the UK and EU) so you can confirm them with your adviser. It never claims the site is compliant on your behalf.'
    },
    faq: [
      { q: 'Does it work with my online booking system?', a: 'Yes. Choose it in the form and the agent adds its booking widget or link to the header and each treatment page. The site\'s own appointment request form stays as a fallback for people who prefer a call.' },
      { q: 'Will the forms collect medical information?', a: 'No. They collect contact details, the treatment someone is interested in and when they are free. Anything clinical is discussed by phone or in the clinic.' }
    ]
  },

  business: {
    types: [
      { value: 'dental', label: 'Dental practice', promptLabel: 'dental practice', selected: true },
      { value: 'medical', label: 'Medical clinic', promptLabel: 'medical clinic' },
      { value: 'therapy', label: 'Therapy or specialist clinic', promptLabel: 'therapy or specialist clinic' }
    ],
    namePlaceholder: 'Elm Street Dental',
    marketLabel: 'Town or city',
    marketPlaceholder: 'Portland, OR',
    marketAsk: 'the town or city the clinic is in',
    taglinePlaceholder: 'Gentle dentistry for the whole family',
    fields: [
      { name: 'phone', label: 'Phone number', hint: 'for click-to-call' },
      { name: 'registration', label: 'Registration or license number', hint: 'optional' }
    ],
    toSpec: function (s) { return { phone: s.phone || null, registration_number: s.registration || null }; }
  },

  audience: {
    legend: 'Who you serve',
    fallback: 'new and existing patients',
    options: [
      { value: 'new', label: 'New patients', checked: true, list: 'New patients' },
      { value: 'families', label: 'Families', checked: true },
      { value: 'children', label: 'Children' },
      { value: 'insured', label: 'Insurance or plan patients', list: 'Plan patients' },
      { value: 'emergency', label: 'Emergency patients', list: 'Emergency patients' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with the main reassurance message and a "Request an appointment" button; treatments; why patients choose the clinic; team; reviews; opening hours.', required: true },
    { id: 'treatments', title: 'Treatments', purpose: 'All treatments, each linking to its own page.', on: true },
    { id: 'team', title: 'Our team', purpose: 'Clinicians and staff with photos, roles and short bios.', on: true },
    { id: 'new-patients', title: 'New patients', purpose: 'How the first visit works, what to bring, and how to register.', on: true },
    { id: 'fees', title: 'Fees and insurance', purpose: 'Fees or fee ranges, payment options and accepted plans.', on: true },
    { id: 'emergency', title: 'Emergency appointments', purpose: 'What to do in an emergency, with the phone number first and a callback form.', audience: 'emergency' },
    { id: 'children', title: 'Children', purpose: 'Care for children and what to expect at a first visit.', audience: 'children' },
    { id: 'reviews', title: 'Patient reviews', purpose: 'Reviews from patients who agreed to be quoted.', on: true },
    { id: 'about', title: 'About', purpose: 'The clinic, its approach and its facilities.', on: true },
    { id: 'faq', title: 'FAQ', purpose: 'Booking, fees, insurance, cancellations and accessibility.', on: true },
    { id: 'blog', title: 'Health tips', purpose: 'General advice articles (good for search traffic). No personal medical advice.' },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, address, map, opening hours and parking.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How contact data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Treatments',
    specKey: 'treatments',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      rename: { singular: 'Treatment', plural: 'Treatments', slug: 'treatments' },
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Treatments', singleName: 'treatment',
      listing: 'list every treatment with the `posts` element (post type `service`), showing the icon, title and summary.',
      single: 'what the treatment is, who it is for, what to expect, how long it takes, aftercare, fees, common questions, and the appointment request form.'
    },
    secondary: [
      { blueprint: 'Team Members', purpose: 'add each clinician and staff member with job title, short bio and photo, and show them on the "Our team" page.' }
    ],
    includedText: 'Always included: a page per treatment with a summary, a fee and an icon, and a Team section for clinicians.',
    extrasLabel: 'Extra treatment details',
    extras: [
      { value: 'duration', label: 'Appointment length', checked: true, key: 'service_duration', type: 'text' },
      { value: 'aftercare', label: 'Aftercare notes', checked: true, key: 'service_aftercare', type: 'textarea' },
      { value: 'faq', label: 'Questions per treatment', checked: true, key: 'service_faq', type: 'list' },
      { value: 'category', label: 'Treatment category', taxonomy: 'treatment_category', terms: ['General', 'Cosmetic', 'Orthodontics', 'Emergency', 'Hygiene'] },
      { value: 'gallery', label: 'Before and after photos', key: 'service_gallery', type: 'gallery' }
    ],
    samples: { label: 'Treatments to draft', options: [0, 3, 6], selected: 6, noun: 'treatments' },
    provider: {
      label: 'Online booking system',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Dentally', 'Cliniko', 'Jane', 'NexHealth', 'Zocdoc', 'Other'],
      hint: 'Optional. If you use one, the agent adds its booking button; the site\'s own request form stays for people who prefer a call.',
      specKey: 'booking_system',
      promptLabel: 'Online booking',
      prompt: 'ask me for the booking link or widget from my account and add a "Book online" button to the header and every treatment page. Keep our appointment request form as the alternative for people who want a call back. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message (with a note not to include medical details)'], where: 'Contact page and footer call to action', required: true },
    { id: 'appointment', title: 'Request an appointment', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'New or existing patient (radio)', 'Treatment of interest (choice)', 'Preferred days and times', 'How should we contact you? (phone / email)'], where: 'Home page, every treatment page and the New patients page', on: true },
    { id: 'callback', title: 'Request a callback', starter: 'Contact', fields: ['Name', 'Phone', 'Best time to call'], where: 'Emergency appointments page and the site header', audience: 'emergency' },
    { id: 'reminders', title: 'Check-up reminders signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive reminder emails'], where: 'Footer and the New patients page', on: true }
  ],

  stages: ['New request', 'Contacted', 'Booked', 'Attended', 'Treatment plan sent', 'Recall due', 'Inactive'],

  emails: [
    { value: 'welcome', label: 'Welcome for new patients', checked: true, description: 'Welcome email for new patients who joined the reminder list: what to expect and how to get in touch' },
    { value: 'recall', label: 'Check-up reminders', checked: true, description: 'Check-up and hygiene reminder (campaign template)' },
    { value: 'review_request', label: 'Review request', description: 'Request for a review after a visit (campaign template)' },
    { value: 'newsletter', label: 'Health tips newsletter', description: 'Seasonal health tips newsletter with general advice only (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      var word = { dental: 'dentist', medical: 'medical clinic', therapy: '[therapy type] clinic' }[s.businessType] || 'clinic';
      var schema = { dental: ['Dentist'], medical: ['MedicalClinic'], therapy: ['MedicalClinic'] }[s.businessType] || ['MedicalClinic'];
      return { primary_keyword: word + (s.market ? ' ' + s.market : ''), schema: schema, local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" on the home page and each treatment name plus the town on its own page. Use ' + spec.seo.schema.join(' and ') + ' structured data with the address, phone and opening hours.';
    }
  },

  compliance: {
    toSpec: function () { return { no_health_data_in_forms: true, privacy_law_to_confirm: true, review_consent: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: clinic name, address, phone, opening hours, ' + (b.registration_number ? 'registration number (' + b.registration_number + '), ' : 'registration or license number (ask me), ') + 'and links to the privacy policy and accessibility information.';
    },
    extraLines: function () {
      return [
        'Forms must never ask about symptoms, conditions, medication or any other health information, and none may be stored in the CRM or sent in marketing emails. Add a short note on every form asking people not to include medical details.',
        'Tell me which privacy rules may apply to the clinic (for example HIPAA in the US, or UK or EU GDPR) and what I should confirm with my adviser. Do not claim the site is compliant.',
        'Only publish patient reviews and before-and-after photos that I confirm the patient agreed to share.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Photos of the clinic and team', 'Clinician names, roles and registration numbers', 'Fees or fee ranges'];
    if (s.provider) out.push('Your ' + s.provider + ' booking link');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a clinic CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete clinic website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Location: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone + ' (show it in the header as a click-to-call link)');
      if (b.registration_number) out.push('- Registration number: ' + b.registration_number);
      return out;
    },
    needs: function () { return 'photos, logo, team details, real fees, patient reviews with consent, copy to review'; },
    editWhat: 'treatments, appointment requests and patients',
    placeholderExample: 'Add your number of patients',
    pluginRule: 'The only third-party addition allowed is the booking system\'s widget, if one is chosen.',
    rules: ['Write health content as general information, never as personal medical advice, and keep claims modest (no "painless" or "guaranteed" results).']
  }
});
