/* Fitness preset: boutique studios, gyms and personal trainers. */
CRMGEN.register({
  id: 'fitness',
  path: '/gym-crm-website/',
  label: 'Fitness studio or gym',
  heroStages: ['Trial', 'Attended', 'Member'],

  page: {
    title: 'Free Gym and Fitness Studio CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for a gym, fitness studio or personal trainer on WordPress: classes, timetable, memberships, free trial sign-ups and a member pipeline. Copy the prompt for your AI agent.',
    h1: 'Free gym and fitness studio CRM website for WordPress',
    lede: 'Classes, a timetable, memberships, trainer profiles and free trial sign-ups, with a pipeline from first trial to paying member. For gyms, boutique studios and personal trainers, built on the free Unyson+ framework.',
    note: 'Works with the class booking software you already use.',
    ogAlt: 'The gym CRM website generator: classes, free trials and a member pipeline',
    genTitle: 'Build your gym or studio CRM website spec',
    schemaName: 'Free Gym and Fitness Studio CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Classes and timetable', d: 'A page for each class with its level and length, and a weekly timetable, or your booking software\'s schedule if you use one.' },
      { t: 'Free trial sign-ups', d: 'The form most visitors need: pick a class, pick a day, and you have a lead.' },
      { t: 'Memberships and pricing', d: 'Plans side by side with what each includes, and a membership enquiry form.' },
      { t: 'Member pipeline', d: 'Leads move from trial booked, to trial attended, to member, and lapsed members are easy to find and win back.' },
      { t: 'Follow-up emails', d: 'A welcome email, a follow-up after a free trial and a win-back offer for lapsed members, saved as drafts.' },
      { t: 'Trainer profiles', d: 'Photos, qualifications and specialities, so people can pick who they want to train with.' }
    ],
    faq: [
      { q: 'Does it work with my class booking software?', a: 'Yes. Choose it in the form and the agent adds its schedule and booking widget to the Classes and Free trial pages. The site\'s own trial form stays for people who are not ready to book.' },
      { q: 'Do the forms ask health questions?', a: 'No. Health questionnaires belong in your booking software or at the front desk, not in a website form or an email list.' }
    ]
  },

  business: {
    types: [
      { value: 'studio', label: 'Boutique studio', promptLabel: 'boutique fitness studio', selected: true },
      { value: 'gym', label: 'Gym', promptLabel: 'gym' },
      { value: 'pt', label: 'Personal trainer', promptLabel: 'personal trainer' }
    ],
    namePlaceholder: 'Northside Strength',
    marketLabel: 'Town or city',
    marketPlaceholder: 'Manchester',
    marketAsk: 'the town or city the studio is in',
    taglinePlaceholder: 'Strength classes for every level',
    fields: [
      { name: 'disciplines', label: 'What you offer', textarea: true, required: true, ask: 'what the studio offers', placeholder: 'Strength and conditioning, HIIT, yoga and mobility, small-group personal training.' },
      { name: 'phone', label: 'Phone number', hint: 'optional' }
    ],
    toSpec: function (s) { return { offers: s.disciplines || '[What the studio offers]', phone: s.phone || null }; }
  },

  audience: {
    legend: 'Who you train',
    fallback: 'beginners and experienced members',
    options: [
      { value: 'beginners', label: 'Beginners', checked: true },
      { value: 'experienced', label: 'Experienced', checked: true, list: 'Experienced members' },
      { value: 'seniors', label: 'Over 55s', list: 'Over 55s' },
      { value: 'kids', label: 'Kids and teens', list: 'Kids and teens' },
      { value: 'corporate', label: 'Companies', list: 'Corporate' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with the main offer and a "Book a free trial" button; classes; how a first visit works; trainers; member stories; membership teaser.', required: true },
    { id: 'classes', title: 'Classes', purpose: 'All classes, each linking to its own page, with filters by level.', on: true },
    { id: 'timetable', title: 'Timetable', purpose: 'The weekly class timetable.', on: true },
    { id: 'memberships', title: 'Memberships and pricing', purpose: 'Plans side by side with what each includes, and the membership enquiry form.', on: true },
    { id: 'trial', title: 'Free trial', purpose: 'What a trial includes and the free trial form.', on: true },
    { id: 'trainers', title: 'Our trainers', purpose: 'Trainer profiles with photos, qualifications and specialities.', type: ['studio', 'gym'] },
    { id: 'pt', title: 'Personal training', purpose: 'One-to-one and small-group training, with the personal training enquiry form.', type: ['pt', 'gym'] },
    { id: 'facilities', title: 'Facilities', purpose: 'Equipment, changing rooms, parking and accessibility.', type: ['gym'] },
    { id: 'kids', title: 'Kids and teens', purpose: 'Classes for younger members and what parents need to know.', audience: 'kids' },
    { id: 'corporate', title: 'Corporate wellness', purpose: 'Programmes for companies, with the corporate enquiry form.', audience: 'corporate' },
    { id: 'stories', title: 'Member stories', purpose: 'Reviews and stories from members.', on: true },
    { id: 'faq', title: 'FAQ', purpose: 'What to bring, first visit, cancellations, freezing a membership.', on: true },
    { id: 'terms', title: 'Membership terms', purpose: 'Contract length, cancellation and freezing rules.', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, address, map and opening hours.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How member and lead data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Classes',
    specKey: 'classes',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      rename: { singular: 'Class', plural: 'Classes', slug: 'classes' },
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Classes', singleName: 'class',
      listing: 'list every class with the `posts` element (post type `service`), showing the icon, title and summary, with live filters by level if that taxonomy exists. Build the Timetable page as a table by day and time, unless the booking software provides a schedule widget.',
      single: 'what the class is, who it suits, level and length, what to bring, the trainers who teach it, when it runs, member stories, and the free trial form.'
    },
    secondary: [
      { blueprint: 'Team Members', purpose: 'add each trainer with job title, short bio, qualifications and photo for the "Our trainers" page.' },
      { blueprint: 'Events', extra: 'events', purpose: 'use it for workshops, challenges and open days, and show upcoming ones on the home page.' }
    ],
    includedText: 'Always included: a page per class with a summary and an icon, and a Team section for trainers.',
    extrasLabel: 'Extra class details',
    extras: [
      { value: 'level', label: 'Level', checked: true, taxonomy: 'class_level', terms: ['Beginner', 'All levels', 'Intermediate', 'Advanced'] },
      { value: 'duration', label: 'Class length', checked: true, key: 'service_duration', type: 'text' },
      { value: 'bring', label: 'What to bring', key: 'service_bring', type: 'textarea' },
      { value: 'gallery', label: 'Class photos', key: 'service_gallery', type: 'gallery' },
      { value: 'events', label: 'Workshops and events' }
    ],
    samples: { label: 'Classes to draft', options: [0, 3, 6], selected: 6, noun: 'class pages' },
    provider: {
      label: 'Class booking software',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Mindbody', 'Glofox', 'Momence', 'TeamUp', 'Wodify', 'Other'],
      hint: 'Optional. If you use one, its schedule and booking widget go on the Classes, Timetable and Free trial pages.',
      specKey: 'booking_system',
      promptLabel: 'Class booking',
      prompt: 'ask me for the schedule and booking widget from my account and add it to the Classes, Timetable and Free trial pages. Keep our free trial form for people who are not ready to book. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'trial', title: 'Book a free trial', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Class of interest (choice)', 'Preferred day (date)', 'Experience (new to training / train regularly)'], where: 'Home page, Free trial page and every class page', on: true },
    { id: 'membership', title: 'Membership enquiry', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Membership of interest (choice)', 'Message'], where: 'Memberships and pricing page', on: true, list: 'Experienced members' },
    { id: 'pt', title: 'Personal training enquiry', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Goals', 'Preferred days and times'], where: 'Personal training page', type: ['pt', 'gym'] },
    { id: 'corporate', title: 'Corporate enquiry', starter: 'Quote request', fields: ['Name', 'Company', 'Email', 'Phone', 'Number of employees', 'What you are looking for'], where: 'Corporate wellness page', audience: 'corporate' },
    { id: 'news', title: 'Timetable and news signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive emails'], where: 'Footer and the Timetable page' }
  ],

  stages: ['New lead', 'Trial booked', 'Trial attended', 'Offer sent', 'Member', 'Lapsed', 'Not now'],

  emails: [
    { value: 'welcome', label: 'Welcome email', checked: true, description: 'Welcome email for new subscribers: how to book a free trial and what to expect' },
    { value: 'trial_followup', label: 'Trial follow-up', checked: true, description: 'Follow-up after a free trial with the membership offer (campaign template)' },
    { value: 'win_back', label: 'Win-back for lapsed members', description: 'Win-back offer for lapsed members (campaign template)' },
    { value: 'newsletter', label: 'Monthly timetable and news', description: 'Monthly timetable changes, events and news (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'crm', 'seo'],

  seo: {
    toSpec: function (s) {
      var word = { studio: 'fitness studio', gym: 'gym', pt: 'personal trainer' }[s.businessType] || 'gym';
      return { primary_keyword: word + (s.market ? ' ' + s.market : ''), schema: [s.businessType === 'gym' ? 'ExerciseGym' : 'HealthClub'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" on the home page and each class name plus the town on its own page. Use ' + spec.seo.schema.join(' and ') + ' structured data with the address, phone and opening hours.';
    }
  },

  compliance: {
    toSpec: function () { return { no_health_data_in_forms: true, no_result_guarantees: true, membership_terms: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: business name, address, phone, opening hours, and links to the membership terms and privacy policy.';
    },
    extraLines: function () {
      return [
        'Forms must not ask health questions (no injuries, conditions or medication). Health questionnaires stay in the booking software or at the front desk.',
        'Do not promise results such as weight loss in a set time, and only publish member photos and stories I confirm the member agreed to share.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Photos of real classes and your space', 'Membership prices and what each includes'];
    if (s.businessType !== 'pt') out.push('Trainer photos, bios and qualifications');
    if (s.provider) out.push('Your ' + s.provider + ' login');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a fitness CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete gym and fitness website',
    extensionsText: 'Post Types, Custom Fields, Forms, CRM and SEO',
    aboutLines: function (b) {
      var out = ['- What it offers: ' + b.offers, '- Location: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone);
      return out;
    },
    needs: function () { return 'photos, logo, trainer details, real prices and timetable, member stories, copy to review'; },
    editWhat: 'classes, the timetable, trial sign-ups and leads',
    placeholderExample: 'Add your member count',
    pluginRule: 'The only third-party addition allowed is the booking software\'s widget, if one is chosen.'
  }
});
