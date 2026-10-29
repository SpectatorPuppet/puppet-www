// Everything the pages say about products, prices and links lives here, so copy changes stay in one file.
// Brand domain and app URLs are not decided yet: set them in the build environment.
const env = (name: string, fallback: string) => (process.env[name] ?? fallback).replace(/\/$/, '');

export const brand = 'Puppet';
export const appUrl = env('APP_URL', 'https://app.example.com');
export const tasksAppUrl = env('TASKS_APP_URL', 'https://tasks.example.com');
export const contactEmail = process.env.CONTACT_EMAIL ?? 'hello@example.com';
export const links = {
  demo: `mailto:${contactEmail}?subject=Puppet%20demo`,
  signup: `${appUrl}/signup`,
  login: `${appUrl}/login`,
  tasksDemo: `${tasksAppUrl}/demo`,
};

// Prices from the go-to-market plan (2026-10-24): per month billed annually, monthly billing about 20% more.
export type Currency = { slug: string; code: string; symbol: string; label: string };
export const currencies: Currency[] = [
  { slug: '', code: 'USD', symbol: '$', label: 'US dollars' },
  { slug: 'eur', code: 'EUR', symbol: '€', label: 'Euros' },
  { slug: 'inr', code: 'INR', symbol: '₹', label: 'Indian rupees' },
];
export const trialDays = 14;
export const minSeats = 2;
export const launchOffer = '30% off your first year for the first 20 accounts.';
export type Plan = { name: string; blurb: string; prices: Record<string, number>; features: string[]; hot?: boolean };
export type ProductPricing = { product: 'Tasks' | 'Booking'; unit: string; plans: Plan[] };
export const pricing: ProductPricing[] = [
  {
    product: 'Tasks', unit: 'per user / month',
    plans: [
      { name: 'Basic', blurb: 'Boards and integrations, no AI.', prices: { USD: 5, EUR: 5, INR: 199 }, features: ['Boards, lists and calendar', 'CI-verified Done gate', 'GitHub, Slack, Discord, calendar', 'Client guests'] },
      { name: 'BYO key', blurb: 'Unlimited AI on your own key.', prices: { USD: 7, EUR: 7, INR: 299 }, features: ['Everything in Basic', 'Voice to tickets', 'Ask your board', 'Claude, OpenAI, Gemini or local model'], hot: true },
      { name: 'Pro', blurb: 'Built-in AI, nothing to set up.', prices: { USD: 9, EUR: 9, INR: 399 }, features: ['Everything in Basic', 'Built-in AI', 'About 300 drafts or questions per user a month, pooled', 'Priority support'] },
    ],
  },
  {
    product: 'Booking', unit: 'per staff calendar / month',
    plans: [
      { name: 'Basic', blurb: 'Online booking on your brand.', prices: { USD: 6, EUR: 6, INR: 249 }, features: ['Booking page on your domain', 'Staff schedules and holidays', 'Reminders', 'Deposits with Stripe'] },
      { name: 'BYO key', blurb: 'AI answers on your own key.', prices: { USD: 8, EUR: 8, INR: 349 }, features: ['Everything in Basic', 'AI answers from your FAQ and services', 'Booking through Claude (MCP)'], hot: true },
      { name: 'Pro', blurb: 'Built-in AI, nothing to set up.', prices: { USD: 11, EUR: 10, INR: 449 }, features: ['Everything in Basic', 'Built-in AI answers', 'Priority support'] },
    ],
  },
];
export const price = (p: Plan, c: Currency) => `${c.symbol}${p.prices[c.code]}`;
export const fromPrice = (product: 'Tasks' | 'Booking', c: Currency = currencies[0]) => price(pricing.find((x) => x.product === product)!.plans[0], c);

export type Feature = { title: string; text: string };
export const tasksFeatures: Feature[] = [
  { title: 'Boards, lists and calendar', text: 'Plan work in the view that fits: kanban boards, lists, a calendar, and an iCal feed for any calendar app.' },
  { title: 'CI-verified Done', text: 'A ticket only moves to Done when every acceptance criterion has a passing test from your CI run. No more "done but broken".' },
  { title: 'Voice to tasks', text: 'Talk through what needs doing; Puppet AI turns the transcript into tickets with acceptance criteria. Audio is deleted once transcribed.' },
  { title: 'Ask your board', text: 'Ask questions in plain words, like "what is blocking the release?", and get answers grounded in your own tickets.' },
  { title: 'Bring your own AI', text: 'Use built-in AI on Pro, a local model, or your own Claude, OpenAI or Gemini key. Your key is never shown again after you save it.' },
  { title: 'Guests and clients', text: 'Invite clients as guests who see only what you share. No extra seat for every stakeholder.' },
];
export const integrations: Feature[] = [
  { title: 'GitHub', text: 'Branches, pull requests and commits that mention a ticket key move the ticket for you.' },
  { title: 'CI test results', text: 'Send JUnit XML or JSON from any CI to prove each acceptance criterion passed.' },
  { title: 'Slack and Discord', text: 'Post ticket updates to the channel your team already reads.' },
  { title: 'Figma, Loom and Docs', text: 'Paste a link and it shows as a rich preview on the ticket.' },
  { title: 'Calendar feed', text: 'Due dates in Google Calendar, Outlook or Apple Calendar.' },
  { title: 'Claude and MCP', text: 'Let Claude or any MCP client read and update your board, with your permissions.' },
];
export const bookingFeatures: Feature[] = [
  { title: 'Booking page on your domain', text: 'Customers book in a few taps on booking.yourbrand.com, in your colors.' },
  { title: 'Real availability', text: 'Staff schedules, breaks and holidays in your business time zone, daylight saving included.' },
  { title: 'AI answers for customers', text: 'Customers ask "do you do evening slots?" and get answers from your FAQ, services and rules.' },
  { title: 'Reminders', text: 'Email and SMS reminders cut no-shows.' },
  { title: 'Deposits and payments', text: 'Take deposits with Stripe when customers book.' },
  { title: 'Works with Claude', text: 'An MCP endpoint lets AI assistants check availability and book for your customers.' },
];

export type Faq = { q: string; a: string };
export const faqs: Faq[] = [
  { q: 'Is there a free trial?', a: `Yes. Every plan starts with a ${trialDays}-day trial with every feature on. Prefer a walkthrough? Book a demo.` },
  { q: 'How much does Puppet cost?', a: `Tasks starts at $5 per user a month (minimum ${minSeats} seats) and Booking at $6 per staff calendar a month, billed annually. Monthly billing is about 20% more. Prices are also in euros and rupees.` },
  { q: 'Is there a launch discount?', a: `Yes: ${launchOffer}` },
  { q: 'What is the difference between BYO key and Pro?', a: 'BYO key gives unlimited AI using your own Claude, OpenAI or Gemini key, so you pay your provider directly. Pro includes built-in AI with a pooled monthly budget of about 300 drafts or questions per user.' },
  { q: 'How is Puppet Tasks different from ClickUp or Jira?', a: 'Tasks is lighter, checks your CI before a ticket can be Done, turns voice notes into tickets, and includes AI in the plan price instead of a per-seat AI add-on.' },
  { q: 'Can I use my own AI key?', a: 'Yes. Use Claude, OpenAI, Gemini or any OpenAI-compatible provider, or a local model with Ollama. Keys are never shown again after you save them.' },
  { q: 'Can I use my own domain?', a: 'Yes. Your booking page and client portal can run on your own domain, in your brand colors.' },
  { q: 'Do you have mobile apps?', a: 'Puppet works as an installable web app on iPhone, iPad and Android today. Native apps are on the roadmap.' },
  { q: 'Is my data secure?', a: 'Each customer\'s data is isolated at the database level, with roles, permissions and signed webhooks.' },
  { q: 'Do you store my voice recordings?', a: 'No. Audio is deleted as soon as it is transcribed. Only the text is kept.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You can export your data whenever you like.' },
];

/** Competitor pages: keep claims factual and neutral; their prices are as of 2026-10 and carry a date on the page. */
export type Comparison = { slug: string; name: string; seoTitle: string; description: string; product: 'Tasks' | 'Booking'; summary: string; rows: [string, string, string][]; pickThem: string; pickUs: string };
export const comparisons: Comparison[] = [
  {
    slug: 'clickup', name: 'ClickUp', product: 'Tasks', seoTitle: 'ClickUp Alternative for Agencies: Puppet Tasks vs ClickUp',
    description: 'Looking for a ClickUp alternative for your agency? Puppet Tasks is lighter, includes AI in the price, and starts at $5 per user. Compare features.',
    summary: 'ClickUp is a broad all-in-one work app. Puppet Tasks is lighter and built for agencies and teams doing client work, with AI included in the plan instead of a per-seat add-on.',
    rows: [
      ['Price per user, billed annually', 'From $5; with AI from $7', 'About $7 to $12, plus $5 to $9 for AI'],
      ['Boards, lists, calendar', 'Yes', 'Yes'],
      ['Done blocked until tests pass', 'Built in', 'Not built in'],
      ['Voice note to tickets', 'Built in', 'Via AI add-on'],
      ['AI with your own key or a local model', 'Yes', 'No, vendor AI only'],
      ['Client guests', 'Yes', 'Yes'],
      ['MCP server for Claude', 'Yes', 'Check their docs'],
    ],
    pickThem: 'You want docs, whiteboards, goals and chat in one huge app and are happy to configure it.',
    pickUs: 'You run client work and want a fast board your team actually finishes, with AI that does not cost extra per seat.',
  },
  {
    slug: 'jira', name: 'Jira', product: 'Tasks', seoTitle: 'Jira Alternative for Small Teams: Puppet Tasks vs Jira',
    description: 'A Jira alternative for small teams: Puppet Tasks sets up in minutes, checks acceptance criteria in CI, and turns voice notes into tickets.',
    summary: 'Jira is the long-standing choice for large engineering orgs. Puppet Tasks gives small teams the parts that matter, without the setup.',
    rows: [
      ['Setup time', 'Minutes', 'Often days of configuration'],
      ['GitHub links move tickets', 'Yes', 'Yes, via app'],
      ['Done blocked until tests pass', 'Built in', 'Needs workflow rules or apps'],
      ['Voice note to tickets', 'Built in', 'No'],
      ['AI with your own key or a local model', 'Yes', 'No, vendor AI only'],
      ['Client guests', 'Yes', 'Limited'],
    ],
    pickThem: 'You have hundreds of engineers, complex workflows and an admin to run them.',
    pickUs: 'You are a small team or agency and want acceptance criteria that CI actually checks.',
  },
  {
    slug: 'calendly', name: 'Calendly', product: 'Booking', seoTitle: 'Calendly Alternative in India and Beyond: Puppet Booking',
    description: 'A Calendly alternative priced in rupees from ₹249 per staff calendar: AI answers for customers, staff schedules and your own domain.',
    summary: 'Calendly is built for scheduling meetings. Puppet Booking is built for businesses that sell services, answers customer questions with AI, and is priced in rupees, euros or dollars.',
    rows: [
      ['Price per seat, billed annually', 'From $6 or ₹249', 'Teams plan about $16'],
      ['AI answers for customers', 'Yes', 'No'],
      ['Services with durations and prices', 'Yes', 'Limited'],
      ['Staff schedules and holidays', 'Yes', 'Team plans'],
      ['Booking page on your domain', 'Yes', 'No, their domain'],
      ['Same account as your project tool', 'Yes, with Tasks', 'No'],
    ],
    pickThem: 'You mostly book one-to-one meetings with clients or candidates.',
    pickUs: 'You run events, a studio or a service business and want a booking page that answers customers before they ask you.',
  },
];

export type Audience = { slug: string; name: string; title: string; description: string; pain: string; points: string[]; product: 'Tasks' | 'Booking' };
export const audiences: Audience[] = [
  { slug: 'agencies', description: 'Client project management for agencies and studios of 3 to 25: client guests, your own brand, voice notes that become tickets, AI included.', name: 'Agencies', product: 'Tasks', title: 'Client project management for agencies', pain: 'Clients ask for updates by email, and every tool charges extra for AI on every seat.', points: ['Clients join as guests', 'Your logo, colors and domain', 'Voice notes from client calls become tickets', 'Figma and Loom links preview on tickets'] },
  { slug: 'consultants', description: 'Project management software for consultants: one board per client, guests who see only their work, and AI that drafts tasks from your call notes.', name: 'Consultants', product: 'Tasks', title: 'Project management software for consultants', pain: 'Every client has their own spreadsheet, inbox thread and status call.', points: ['One board per client', 'Clients see only what you share', 'Call notes become tasks with AI', 'Book client sessions with Puppet Booking'] },
  { slug: 'events', description: 'Booking software for events and workshops: sessions with capacity, reminders, deposits, and AI that answers attendee questions before they email you.', name: 'Event organisers', product: 'Booking', title: 'Booking software for events and workshops', pain: 'Attendees email the same questions about times, prices and venues all week.', points: ['AI answers questions from your event FAQ', 'Reminders before every session', 'Deposits when people book', 'Plan the event itself on a Tasks board'] },
  { slug: 'software-teams', description: 'Project management for dev teams on Claude: an MCP server, acceptance criteria checked by CI, GitHub-linked tickets and AI on your own key.', name: 'Dev teams on Claude', product: 'Tasks', title: 'Project management for dev teams using Claude', pain: 'Tickets marked Done that still fail in production waste a sprint every month.', points: ['Claude reads and updates tickets over MCP', 'Acceptance criteria checked by CI', 'GitHub pull requests move tickets', 'Ask your board what is blocking the release'] },
  { slug: 'ai-own-api-key', description: 'AI project management with your own API key: unlimited voice-to-ticket drafts and board answers on Claude, OpenAI, Gemini or a local model, from $7.', name: 'Bring your own AI key', product: 'Tasks', title: 'AI project management with your own API key', pain: 'Per-seat AI add-ons charge everyone, whether they use AI or not.', points: ['Unlimited AI on your own key for $7 per user', 'Claude, OpenAI, Gemini or a local model', 'Keys are never shown again after saving', 'Switch to built-in AI on Pro any time'] },
  { slug: 'salons', description: 'Online booking for salons and spas: a booking page on your domain, staff schedules, reminders and deposits that cut no-shows.', name: 'Salons and spas', product: 'Booking', title: 'Online booking for salons and spas', pain: 'Phone bookings and no-shows cost hours every week.', points: ['Customers book 24/7 on your own page', 'Staff schedules and breaks', 'Reminders to cut no-shows', 'Deposits for long treatments'] },
];

export type Post = { slug: string; title: string; description: string; date: string; body: string[] };
export const posts: Post[] = [
  {
    slug: 'definition-of-done-ci', date: '2026-10-24',
    title: 'Make "Done" mean tested: CI-checked acceptance criteria',
    description: 'Why tickets reopen after Done, and how linking each acceptance criterion to a passing test fixes it.',
    body: [
      'Most teams have a ticket that was "done" and then came back. The cause is usually the same: nobody checked the acceptance criteria against a real test run.',
      'Puppet Tasks adds a simple gate. Each criterion on a ticket is linked to a test name. When your CI sends its results (JUnit XML or JSON), passing tests tick the criteria. A ticket can only move to Done when every criterion has a passing test.',
      'Start small: add one criterion and one test to your next ticket, send results from the CI you already use, and watch the board update itself.',
    ],
  },
  {
    slug: 'voice-notes-to-tasks', date: '2026-10-24',
    title: 'Turn a 2-minute voice note into a sprint of tickets',
    description: 'How to capture work by talking, with AI that drafts tickets and acceptance criteria, and why we delete the audio.',
    body: [
      'Typing tickets after a client call is where details get lost. Talking is faster.',
      'In Puppet Tasks you record a note, the audio is transcribed and then deleted, and AI drafts tickets with titles, descriptions and acceptance criteria. You review the drafts before anything is created.',
      'You choose the AI: built-in on Pro, or your own key on BYO key.',
    ],
  },
  {
    slug: 'reduce-no-shows', date: '2026-10-24',
    title: '5 ways small businesses cut appointment no-shows',
    description: 'Reminders, deposits, easy rescheduling and clear policies: practical steps to fill your calendar.',
    body: [
      '1. Send a reminder the day before and a second one a few hours before.',
      '2. Take a small deposit for long or high-value appointments.',
      '3. Make rescheduling one tap, so customers move a slot instead of skipping it.',
      '4. Put your cancellation policy on the booking page, not in small print.',
      '5. Let customers book online 24/7, so they pick times they can actually make.',
    ],
  },
  {
    slug: 'bring-your-own-ai-key', date: '2026-10-24',
    title: 'Bring your own AI key: why it saves teams money',
    description: 'Per-seat AI add-ons add up. Using your own key or a free local model keeps AI costs in your control.',
    body: [
      'Many work tools charge an AI add-on for every seat, whether people use it or not.',
      'Puppet lets you plug in your own Claude, OpenAI or Gemini key, or run a free local model with Ollama. You pay your provider for what you actually use, and your key is never shown again after saving.',
      'Teams that prefer zero setup can pick Pro, with built-in AI and a pooled monthly budget.',
    ],
  },
];
