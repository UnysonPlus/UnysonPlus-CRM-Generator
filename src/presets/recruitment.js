/* Recruitment preset: independent recruiters and agencies. Jobs use the Jobs blueprint. */
CRMGEN.register({
  id: 'recruitment',
  path: '/recruitment-agency-crm-website/',
  label: 'Recruitment agency',

  page: {
    title: 'Free Recruitment Agency CRM Website Generator for WordPress | Unyson+',
    description: 'Build a free recruitment agency CRM website on WordPress: job board, applications with CV upload, candidate registration, vacancy requests from employers and a placement pipeline. Copy the prompt for your AI agent.',
    h1: 'Free recruitment agency CRM website for WordPress',
    lede: 'A job board with filters, applications with CV upload, candidate registration, vacancy requests from employers and a pipeline from application to placement. Built on the free Unyson+ framework.',
    note: 'Works alongside the applicant tracking system you already use.',
    ogAlt: 'The recruitment agency CRM website generator: jobs, applications and placements',
    genTitle: 'Build your recruitment CRM website spec',
    schemaName: 'Free Recruitment Agency CRM Website Generator',
    faqCommon: true,
    included: [
      { t: 'Job board', d: 'Every vacancy with salary, location, contract type and sector, filterable, and marked up so search engines can list it as a job.' },
      { t: 'Applications with CV upload', d: 'Candidates apply to a job or register their CV, and each application is stored as an entry.' },
      { t: 'Vacancy requests', d: 'Employers send you a role to fill, which goes into the CRM as a client lead.' },
      { t: 'Placement pipeline', d: 'Candidates move from applied, to screened, to interview, offer and placed.' },
      { t: 'Job alerts', d: 'Candidates sign up for new jobs in their sector, and you send them a regular bulletin.' },
      { t: 'Candidate privacy', d: 'A candidate privacy notice, consent to keep each CV and a retention period you choose.' }
    ],
    callout: {
      title: 'A note on candidate data',
      html: 'CVs hold a lot of personal information, so the prompt keeps the forms to what you need to place someone: no date of birth, photo, marital status or nationality questions. Every application asks for consent to keep the CV, and the agent adds a candidate privacy notice and asks you how long CVs should be kept. If you use an applicant tracking system, the agent connects to it rather than keeping two copies where it can.'
    },
    faq: [
      { q: 'Does it work with my applicant tracking system?', a: 'Yes. Choose it in the form and the agent asks how your system publishes jobs and receives applications. If it can feed jobs to the site or receive applications, the agent uses that and tells you what it set up.' },
      { q: 'Will job ads show up in search engines\' job listings?', a: 'Each job page is marked up with JobPosting structured data, which is what search engines read for their job listings.' }
    ]
  },

  business: {
    types: [
      { value: 'solo', label: 'Independent recruiter', promptLabel: 'independent recruiter' },
      { value: 'team', label: 'Agency', promptLabel: 'recruitment agency', selected: true },
      { value: 'multi', label: 'Multi-office agency', promptLabel: 'multi-office recruitment agency' }
    ],
    namePlaceholder: 'Keystone Talent',
    marketLabel: 'Region served',
    marketPlaceholder: 'London and the South East',
    marketAsk: 'the region the agency recruits in',
    taglinePlaceholder: 'Finance and office roles, filled fast',
    fields: [
      { name: 'sectors', label: 'Sectors you recruit for', textarea: true, required: true, ask: 'the sectors the agency recruits for', placeholder: 'Accounting and finance, office support, HR.' },
      { name: 'phone', label: 'Phone number', hint: 'optional' },
      { name: 'licence', label: 'Agency licence or registration', hint: 'optional' }
    ],
    toSpec: function (s) { return { sectors: s.sectors || '[Sectors]', phone: s.phone || null, licence_number: s.licence || null }; }
  },

  audience: {
    legend: 'Who you work with',
    fallback: 'candidates and employers',
    options: [
      { value: 'candidates', label: 'Candidates', checked: true },
      { value: 'employers', label: 'Employers', checked: true },
      { value: 'contractors', label: 'Contractors and temps', list: 'Contractors' },
      { value: 'graduates', label: 'Graduates' }
    ]
  },

  pages: [
    { id: 'home', title: 'Home', purpose: 'Hero with a job search and two buttons ("Find a job" and "Hire talent"); latest jobs; sectors; why work with the agency; success stories.', required: true },
    { id: 'jobs', title: 'Jobs', purpose: 'All live jobs with filters by sector, contract type and work style.', on: true },
    { id: 'candidates', title: 'For candidates', purpose: 'How the agency helps candidates, with the CV registration form.', audience: 'candidates' },
    { id: 'employers', title: 'For employers', purpose: 'How the agency recruits, fees model in general terms, and the vacancy form.', audience: 'employers' },
    { id: 'contract', title: 'Contract and temp work', purpose: 'How contract and temporary work works, with the CV registration form.', audience: 'contractors' },
    { id: 'graduates', title: 'Graduates', purpose: 'Graduate roles and advice for a first job.', audience: 'graduates' },
    { id: 'sectors', title: 'Sectors', purpose: 'One section per sector, each linking to its jobs.', on: true },
    { id: 'team', title: 'Our consultants', purpose: 'Consultants with photos, sectors and contact details.', type: ['team', 'multi'] },
    { id: 'stories', title: 'Success stories', purpose: 'Reviews from candidates and clients.', on: true },
    { id: 'about', title: 'About', purpose: 'The agency\'s story and approach.', on: true },
    { id: 'advice', title: 'Career advice', purpose: 'CV, interview and market advice (good for search traffic).' },
    { id: 'contact', title: 'Contact', purpose: 'Contact form, phone, email and office addresses.', required: true },
    { id: 'candidate-privacy', title: 'Candidate privacy notice', purpose: 'What happens to a CV, who sees it and how long it is kept.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How all other data is collected, stored and used.', required: true }
  ],

  content: CRMGEN.blueprintContent({
    legend: 'Jobs',
    specKey: 'jobs',
    primary: {
      blueprint: 'jobs', title: 'Job Listings', key: 'job_listing', archive: 'careers', group: 'Role Details',
      rename: { singular: 'Job', plural: 'Jobs', slug: 'jobs' },
      after: 'In the same post type settings, turn **Exclude from search** off so live jobs appear in site search (the blueprint hides them by default because it is designed for in-house careers pages). Rename the `job_department` taxonomy\'s labels to "Sector" / "Sectors"; keep `job_type` as the contract type.',
      baseText: 'location, salary range, closing date, hiring manager and apply URL, plus the Department and Contract Type taxonomies',
      baseFields: ['job_location', 'job_salary', 'job_closes', 'job_manager', 'job_apply_url'],
      listTitle: 'Jobs', singleName: 'job',
      listing: 'list live jobs with the `posts` element (post type `job_listing`), newest first, with live filters by `job_department` (sector), `job_type` and work style if that taxonomy exists. Hide jobs whose closing date has passed.',
      single: 'role summary, salary, location, contract type, closing date, responsibilities, requirements, the consultant handling it, the application form, and similar jobs. Add JobPosting structured data from these fields.'
    },
    secondary: [
      { blueprint: 'Team Members', extra: 'consultants', purpose: 'add each consultant with job title, sectors, contact details and photo for the "Our consultants" page.' }
    ],
    includedText: 'Always included: a page per job with location, salary range, closing date, sector and contract type.',
    extrasLabel: 'Extra job details',
    extras: [
      { value: 'reference', label: 'Job reference', checked: true, key: 'job_reference', type: 'text' },
      { value: 'work_style', label: 'Work style', checked: true, taxonomy: 'job_work_style', terms: ['On-site', 'Hybrid', 'Remote'] },
      { value: 'benefits', label: 'Benefits', key: 'job_benefits', type: 'list' },
      { value: 'start', label: 'Start date', key: 'job_start', type: 'date' },
      { value: 'consultants', label: 'Consultant profiles', checked: true }
    ],
    samples: { label: 'Example jobs to draft', options: [0, 3, 6], selected: 3, noun: 'example jobs' },
    provider: {
      label: 'Applicant tracking system',
      when: [''],
      placeholder: 'None / not sure',
      options: ['Bullhorn', 'Vincere', 'JobAdder', 'Recruit CRM', 'Other'],
      hint: 'Optional. If it can publish jobs or receive applications, the agent connects to it.',
      specKey: 'ats',
      promptLabel: 'Applicant tracking system',
      prompt: 'ask me how my ATS publishes jobs and receives applications (a job feed, a plugin, an embed, or an email address it reads). If it can publish jobs to the site, use that instead of entering jobs by hand; if it can receive applications, send them there as well as to the site. Tell me exactly what you connected. Never invent account details.'
    }
  }),

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer call to action', required: true },
    { id: 'apply', title: 'Apply for this job', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Job (hidden: page title)', 'CV (file upload: PDF or Word)', 'Short cover note', 'Consent to keep my CV for the period in the candidate privacy notice (consent, terms)'], where: 'Every single job page', on: true },
    { id: 'register', title: 'Register your CV', starter: 'Contact', fields: ['Name', 'Email', 'Phone', 'Sector (choice)', 'Type of work wanted (permanent / contract / temporary)', 'CV (file upload: PDF or Word)', 'Consent to keep my CV (consent, terms)'], where: 'For candidates page and the Jobs page', audience: 'candidates' },
    { id: 'vacancy', title: 'Register a vacancy', starter: 'Quote request', fields: ['Name', 'Company', 'Email', 'Phone', 'Role title', 'Location', 'Salary budget', 'Start date (date)', 'Details'], where: 'For employers page and the home page', audience: 'employers' },
    { id: 'alerts', title: 'Job alerts signup', starter: 'Newsletter signup', fields: ['Name', 'Email', 'Sectors of interest', 'Consent to receive job emails'], where: 'Jobs page and footer', on: true }
  ],

  stages: ['New', 'Screened', 'Submitted to client', 'Interview', 'Offer', 'Placed', 'Not progressed'],

  emails: [
    { value: 'welcome', label: 'Welcome email', checked: true, description: 'Welcome email for new job alert subscribers' },
    { value: 'job_alerts', label: 'Job alerts bulletin', checked: true, description: 'New jobs bulletin for each sector list (campaign template)' },
    { value: 'client_update', label: 'Market update for employers', description: 'Hiring market update for employer contacts (campaign template)' },
    { value: 'placement_checkin', label: 'Placement check-in', description: 'Check-in a few weeks after a placement (campaign template)' }
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'newsletter-crm', 'seo'],

  seo: {
    toSpec: function (s) {
      return { primary_keyword: '[sector] recruitment agency' + (s.market ? ' ' + s.market : ''), schema: ['EmploymentAgency', 'JobPosting'], local: true };
    },
    promptLine: function (spec) {
      return 'In the SEO extension, give every page a unique title and description. Target "' + spec.seo.primary_keyword + '" (with the main sector) on the home page and "[sector] jobs [region]" on each sector section. Use EmploymentAgency structured data for the agency and JobPosting on every job page.';
    }
  },

  compliance: {
    toSpec: function () { return { candidate_privacy_notice: true, cv_consent: true, cv_retention_to_confirm: true, no_protected_characteristics: true, privacy_policy: true, form_consent: true }; },
    footerLine: function (b) {
      return 'Footer: agency name, office address, phone, ' + (b.licence_number ? 'licence number (' + b.licence_number + '), ' : '') + 'an equal opportunities statement, and links to the candidate privacy notice and privacy policy.';
    },
    extraLines: function () {
      return [
        'Ask me how long CVs should be kept, and put that period in the candidate privacy notice and on every CV form.',
        'Forms must not ask for date of birth, age, photo, marital status, nationality, religion or health. Ask for right to work only if I say so, as a yes or no question.',
        'Job ads must not state age, gender or other protected characteristics as requirements.'
      ];
    }
  },

  prepare: function (s) {
    var out = ['Real job ads to publish', 'How long you keep CVs'];
    if (s.businessType !== 'solo') out.push('Consultant photos and sectors');
    if (s.provider) out.push('Your ' + s.provider + ' account details');
    return out;
  },

  prompt: {
    title: function (b) { return 'Build a recruitment agency CRM website for ' + b.name + ' with Unyson+'; },
    intro: 'a complete recruitment agency website',
    extensionsText: 'Post Types, Custom Fields, Forms, Newsletter CRM and SEO',
    aboutLines: function (b) {
      var out = ['- Sectors: ' + b.sectors, '- Region: ' + b.market];
      if (b.tagline) out.push('- Tagline: ' + b.tagline);
      if (b.phone) out.push('- Phone: ' + b.phone);
      if (b.licence_number) out.push('- Licence number: ' + b.licence_number);
      return out;
    },
    needs: function () { return 'real jobs, logo, consultant details, reviews, CV retention period, copy to review'; },
    editWhat: 'jobs, applications, CVs and leads',
    placeholderExample: 'Add your number of placements',
    pluginRule: 'The only third-party addition allowed is the applicant tracking system\'s integration, if one is chosen.',
    rules: ['Leads from employers and candidates go into separate lists so emails for one never reach the other.']
  }
});
