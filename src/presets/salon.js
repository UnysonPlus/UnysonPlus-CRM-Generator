/* Salon preset: hair salons, beauty salons and spas, barbers, nail studios. */
CRMGEN.register({
  id: 'salon',
  path: '/salon-spa-crm-website/',
  label: 'Salon and spa',
  heroStages: ['Enquiry', 'Booked', 'Regular'],

  page: {
    title: 'Free Salon and Spa CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free CRM website for a hair salon, beauty salon, spa, barber or nail studio on WordPress: services and prices, booking requests, a gallery and a client pipeline. Copy the prompt for your AI agent.',
    h1: 'Free salon and spa CRM website for WordPress',
    lede: 'Services and prices, your team, a gallery of your work and booking requests, with rebooking reminders that turn first visits into regulars. For hair and beauty salons, spas, barbers and nail studios, on the free Unyson+ framework.',
    note: 'Works with the online booking system you already use.',
    ogAlt: 'The salon CRM website generator: services, bookings and rebooking reminders',
    genTitle: 'Build your salon CRM website spec',
    schemaName: 'Free Salon and Spa CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Services and prices', d: 'Every service with its price, length and category, so clients know what to book before they ask.' },
      { t: 'Booking requests', d: 'Clients pick a service, a stylist and a day; your booking system\'s button sits next to it if you use one.' },
      { t: 'Gallery of your work', d: 'Before and after photos, published only with your clients\' permission.' },
      { t: 'Client pipeline', d: 'From first enquiry to booked, visited, rebooked and regular, and lapsed clients are easy to find.' },
      { t: 'Rebooking reminders', d: 'A reminder a few weeks after a visit and a welcome email for new clients, saved as drafts.' },
      { t: 'Bridal and events', d: 'An enquiry form for weddings and group bookings, which are worth more than a regular visit.' }
    ],
    faq: [
      { q: 'Does it work with my booking system?', a: 'Yes. Choose it in the form and the agent adds its "Book now" button to the header and every service page. The site\'s own booking request form stays for people who prefer to be contacted.' },
      { q: 'Can I show before and after photos?', a: 'Yes, and the prompt tells the agent to publish only photos you confirm your clients agreed to share.' }
    ]
  },

  business: {
    types: [
      { value: 'hair', label: 'Hair salon', promptLabel: 'hair salon', selected: true },
      { value: 'beauty', label: 'Beauty salon or spa', promptLabel: 'beauty salon and spa' },
      { value: 'barber', label: 'Barbershop', promptLabel: 'barbershop' },
      { value: 'nails', label: 'Nail studio', promptLabel: 'nail studio' }
    ],
    namePlaceholder: 'Willow & Rose Hair Studio',
    marketLabel: 'Town or city',
    marketPlaceholder: 'Brighton',
    marketAsk: 'the town or city the salon is in',
    taglinePlaceholder: 'Colour, cuts and care in the heart of Brighton',
    fields: [
      { name: 'phone', label: 'Phone number', hint: 'for click-to-call' },
      { name: 'address', label: 'Address', hint: 'optional' }
    ],
    toSpec: function (s) { return { phone: s.phone || null, address: s.address || null }; }
  },

  audience: {
    legend: 'Who you serve',
    fallback: 'new and regular clients',
    options: [
      { value: 'new', label: 'New clients', checked: true, list: 'New clients' },
      { value: 'regulars', label: 'Regular clients', checked: true, list: 'Regulars' },
      { value: 'bridal', label: 'Bridal and events', list: 'Bridal and events' },
      { value: 'mens', label: 'Men\'s grooming', list: 'Men\'s grooming' },
      { value: 'kids', label: 'Kids', list: 'Kids' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with the salon\'s look and a "Book now" button; featured services; gallery; team; reviews; opening hours.', required: true },
    { id: 'services', title: 'Services and prices', purpose: 'All services grouped by category, with prices and lengths.', on: true },
    { id: 'team', title: 'Our team', purpose: 'Stylists and therapists with photos and specialities.', on: true },
    { id: 'gallery', title: 'Gallery', purpose: 'Photos of the salon and clients\' results, shared with permission.', on: true },
    { id: 'bridal', title: 'Bridal and events', purpose: 'Wedding and group packages, with the bridal enquiry form.', audience: 'bridal' },
    { id: 'offers', title: 'Offers and gift cards', purpose: 'Current offers and how to buy a gift card.' },
    { id: 'reviews', title: 'Reviews', purpose: 'Client reviews.', on: true },
    { id: 'about', title: 'About', purpose: 'The salon\'s story, products used and approach.', on: true },
    { id: 'faq', title: 'FAQ', purpose: 'Booking, patch tests, lateness, cancellations and payment.', on: true },
    { id: 'policy', title: 'Booking policy', purpose: 'Deposits, cancellations, lateness and patch tests.', on: true },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email, address, map, opening hours and parking.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How client data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Services',
    specKey: 'services',
    primary: {
      blueprint: 'services', title: 'Services', key: 'service', archive: 'services', group: 'Service Details',
      baseText: 'short summary, price from, and icon',
      baseFields: ['service_summary', 'service_price', 'service_icon'],
      listTitle: 'Services and prices', singleName: 'service',
      listing: 'list every service with the `posts` element (post type `service`), grouped or filtered by category if that taxonomy exists, showing the title, price and length. A clear price list matters more than large images here.',
      single: 'what the service involves, how long it takes, the price, who on the team offers it, photos of results, aftercare, and the booking request form.'
    },
    secondary: [
      { blueprint: 'Team Members', purpose: 'add each stylist or therapist with job title, short bio, specialities and photo for the "Our team" page.' }
    ],
    includedText: 'Always included: a page per service with a summary, a price and an icon, and a Team section.',
    extrasLabel: 'Extra service details',
    extras: [
      { value: 'duration', label: 'Length', checked: true, key: 'service_duration', type: 'text' },
      { value: 'category', label: 'Category', checked: true, taxonomy: 'service_category', terms: ['Cuts', 'Colour', 'Styling', 'Treatments', 'Nails', 'Skin', 'Massage'] },
      { value: 'gallery', label: 'Before and after photos', checked: true, key: 'service_gallery', type: 'gallery' },
      { value: 'patch', label: 'Patch test required', key: 'service_patch_test', type: 'switch' },
      { value: 'aftercare', label: 'Aftercare', key: 'service_aftercare', type: 'textarea' }
    ],
    samples: { label: 'Services to draft', options: [0, 3, 6], selected: 6, noun: 'service pages' },
    provider: {
      label: 'Online booking system',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Fresha', 'Vagaro', 'Booksy', 'Square Appointments', 'Timely', 'Other'],
      hint: 'Optional. If you use one, its "Book now" button goes in the header and on every service page.',
      specKey: 'booking_system',
      promptLabel: 'Online booking',
      prompt: 'ask me for the booking link or widget from my account and add a "Book now" button to the header and every service page. Keep our booking request form for clients who prefer to be contacted. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'booking', title: 'Booking request', starter: 'Booking / Appointment', fields: ['Name', 'Email', 'Phone', 'Service (choice)', 'Preferred stylist (choice, optional)', 'Preferred date (date)', 'Message'], where: 'Home page, Services and prices page and every service page', on: true },
    { id: 'bridal', title: 'Bridal and events enquiry', starter: 'Quote request', fields: ['Name', 'Email', 'Phone', 'Event date (date)', 'Number of people', 'Services wanted', 'Message'], where: 'Bridal and events page', audience: 'bridal', list: 'Bridal and events' },
    { id: 'news', title: 'Offers and news signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Consent to receive emails'], where: 'Footer, and the Offers and gift cards page if it exists', on: true, list: 'Regulars' }
  ],

  stages: ['New enquiry', 'Booked', 'Visited', 'Rebooked', 'Regular', 'Lapsed'],

  emails: [
    { value: 'welcome', label: 'Welcome email', checked: true, description: 'Welcome email for new clients who joined the list' },
    { value: 'rebook', label: 'Rebooking reminder', checked: true, description: 'Rebooking reminder a few weeks after a visit (campaign template)' },
    { value: 'win_back', label: 'Win-back offer', description: 'Offer for clients who have not visited in a while (campaign template)' },
    { value: 'news', label: 'Seasonal offers', description: 'Seasonal offers and news (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      var word = { hair: 'hair salon', beauty: 'beauty salon', barber: 'barber', nails: 'nail salon' }[s.businessType] || 'salon';
      var schema = { hair: 'HairSalon', beauty: 'BeautySalon', barber: 'HairSalon', nails: 'NailSalon' }[s.businessType] || 'BeautySalon';
      return { primary_keyword: word + (s.market ? ' ' + s.market : ''), schema: [schema], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" on the home page and each service plus the town on its own page. Use ' + spec.seo.schema.join(' and ') + ' structured data with the address, phone, opening hours and price range.';
    }
  },

  compliance: {
    toSpec: function () { return { photo_consent: true, booking_policy: true, patch_test_notice: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: salon name, ' + (b.address ? 'address (' + b.address + '), ' : 'address, ') + 'phone, opening hours, and links to the booking policy and privacy policy.';
    },
    extraLines: function () {
      return [
        'Only publish client photos that I confirm the client agreed to share.',
        'Show a patch test notice on colour, lash and brow services, and show prices as "from" unless I give fixed prices.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Your price list', 'Photos of the salon and your work, with client permission', 'Team photos and specialities'];
    if (s.provider) out.push('Your ' + s.provider + ' booking link');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a salon CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete salon website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Location: ' + b.market];
      if (b.address) out.push('- Address: ' + b.address);
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone + ' (show it in the header as a click-to-call link)');
      return out;
    },
    needs: function () { return 'price list, photos with client permission, logo, team details, reviews, copy to review'; },
    editWhat: 'services, prices, booking requests and clients',
    placeholderExample: 'Add your years in business',
    pluginRule: 'The only third-party addition allowed is the booking system\'s button or widget, if one is chosen.'
  }
});
