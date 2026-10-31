// Site content. Statuses and team names come from the owner (task file, 29–30 Oct 2026).
// Dates from the owner (30 Oct 2026). A value written as [DATE] or [MONTH] shows highlighted as a placeholder.
export const SITE = {
  url: "https://www.agentiqly.io",
  name: "AgentiQly.io",
  email: "moshe@agentiqly.io",
  kicker: "ISRAELI–US AI AGENTIC STARTUP INCUBATOR",
  title: "AgentiQly.io · Israeli–US AI agentic startup incubator",
  description: "AgentiQly.io is a joint Israeli–US AI agentic startup incubator. We build AI products, run them on our own businesses, and publish what happened.",
  footerLine: "Israeli–US AI agentic startup incubator",
  studioLogAsOf: "30 October 2026",
  programStart: "30 October 2026",
  firstReport: "November 2026",
};

export const NAV = [
  { href: "/#ventures", label: "Ventures" },
  { href: "/#proof", label: "Track record" },
  { href: "/#how", label: "How we build" },
  { href: "/team/", label: "Team" },
  { href: "/blog/", label: "Blog" },
];

// tone: good = green label, warn = amber label, muted = grey label
export const STATUS = {
  beta: { label: "IN BETA", tone: "good" },
  ours: { label: "ON OUR SITES", tone: "good" },
  prelaunch: { label: "PRE-LAUNCH", tone: "warn" },
  build: { label: "IN BUILD", tone: "warn" },
  hold: { label: "ON HOLD", tone: "muted" },
};

export const VENTURES = [
  {
    slug: "agentiqly-ai",
    name: "AgentiQly.ai",
    status: "beta",
    site: "https://agentiqly.ai",
    line: "An AI sales agent for online stores that answers buyers, tracks orders and reports the sales it actually closed.",
    note: "In beta with our first client.",
    customer: "Online stores that sell to the public and answer the same buyer questions every day: sizes, stock, shipping, order status.",
    problem: "Buyers who can't get a fast answer leave. Staff who answer chat all day can't do anything else, and most chat tools report conversations, not sales.",
    market: [
      { text: "US retail e-commerce sales were $340.2 billion in the second quarter of 2026 (seasonally adjusted), 17.1% of all retail sales, and 12.2% higher than a year earlier.", source: { title: "US Census Bureau, Quarterly Retail E-Commerce Sales, 2nd quarter 2026", url: "https://www.census.gov/retail/ecommerce.html" } },
    ],
    others: "Store chat widgets, help-desk inboxes with chat, and general-purpose chatbots that a store trains itself.",
    differs: "It is measured on sales it closed and orders it tracked, and every answer it can't confirm is flagged for a person instead of guessed.",
    potential: "Prove it on our first client's store, then offer it to stores with the same questions. Success looks like a store owner who can show the sales the agent closed, month by month.",
  },
  {
    slug: "content-engine",
    name: "Content engine",
    status: "ours",
    site: null,
    line: "Turns real customer questions into sourced articles and FAQs, checked five ways before anything is published.",
    note: "Writing for our own sites now.",
    customer: "Businesses whose customers ask the same questions in chat, email and search, and who need answers on their own site that search engines and AI assistants can find.",
    problem: "Most business blogs are written to fill a calendar. They answer nobody's question, repeat what everyone else wrote, and can't show where a fact came from.",
    market: [],
    others: "Content agencies, freelance writers, and AI writing tools that produce drafts for a person to check.",
    differs: "It starts from questions customers really asked, uses only facts from pages it fetched and read, and checks every piece five ways (facts, AI tells, rhythm, fresh eyes, search and AI) before a person approves it.",
    potential: "Run it on our own sites in the proof program, publish the results month by month, then offer it as a subscription. Success looks like more search and AI-assistant visits on our own sites, shown with the raw numbers.",
  },
  {
    slug: "lifeiq",
    name: "LifeIQ",
    status: "prelaunch",
    site: "https://lifeiq.dev",
    line: "A personal AI companion that connects to your email and WhatsApp and finds the bills, renewals and refund windows you've forgotten about.",
    note: null,
    customer: "People and families who juggle insurance renewals, warranties, subscriptions, appointments and the paperwork that comes with them.",
    problem: "The dates live in inboxes, drawers and other people's portals. Missing one costs money: a lapsed policy, an auto-renewal, a late fee.",
    market: [],
    others: "Calendar and reminder apps, password and document vaults, and spreadsheets.",
    differs: "You connect your email once. It finds what needs you and hands you a short list, instead of waiting for you to type in dates.",
    potential: "Launch to a first group of users, then grow by word of mouth and search. Success looks like users who stop missing renewals, which we will measure and publish.",
  },
  {
    slug: "clearopsiq",
    name: "ClearOpsIQ",
    status: "build",
    site: "https://clearopsiq.com",
    line: "Operations intelligence for Amazon and ecommerce sellers: what changed, what it cost, and what to check next.",
    note: null,
    customer: "Amazon and ecommerce sellers with enough products, suppliers and channels that problems hide in the reports.",
    problem: "A supplier delay, a stock-out or a fee change shows up weeks later as lost money. The data to catch it exists, spread across reports nobody has time to read.",
    market: [
      { text: "US retail e-commerce sales were $340.2 billion in the second quarter of 2026 (seasonally adjusted), 17.1% of all retail sales.", source: { title: "US Census Bureau, Quarterly Retail E-Commerce Sales, 2nd quarter 2026", url: "https://www.census.gov/retail/ecommerce.html" } },
    ],
    others: "Marketplace analytics dashboards, inventory and repricing tools, and spreadsheets kept by hand.",
    differs: "It explains one business consequence at a time (what changed, what it cost, what to check next) and says where every figure came from.",
    potential: "Finish the build, run it on our own selling data, then open it to sellers. Success looks like problems caught before they cost money, shown with real examples.",
  },
  {
    slug: "adjusterospro",
    name: "AdjusterOS Pro",
    status: "beta",
    site: "https://adjusterospro.com",
    line: "A working system for insurance adjusters: claims intake, documents and deadlines in one place.",
    note: null,
    customer: "Independent and public insurance adjusters, and the restoration contractors who work claims with them.",
    problem: "A claim lives across email, photos, PDFs, carrier portals and a calendar. Deadlines slip and evidence gets lost between them.",
    market: [
      { text: "376,100 people were employed in the US as claims adjusters, appraisers, examiners and investigators in 2025. The Bureau of Labor Statistics projects 20,900 openings a year through 2035.", source: { title: "Bureau of Labor Statistics 2025–2035 employment projections, via O*NET OnLine, occupation 13-1031", url: "https://www.onetonline.org/link/localtrends/13-1031.00" } },
    ],
    others: "General claims-management software, carrier portals, and folders of email and spreadsheets.",
    differs: "It is built for the adjuster's side of the claim: intake, documents, deadlines and evidence in one place, ready for the phone.",
    started: "We first built it for a client. We saw that other adjusters had the same need, so with the client's approval we built it for the wider market.",
    potential: "One beta tester has used it for a couple of months, and a second has just joined. The next step is finishing it with them, then selling it by subscription. Success looks like adjusters who keep every claim's deadlines and evidence in one place.",
  },
  {
    slug: "snfiq",
    name: "SNF IQ",
    status: "hold",
    site: "https://snfiq.io",
    line: "Acquisition research for skilled nursing facilities, scoring which owners are likely to sell.",
    note: "On hold while we finish the other ventures.",
    customer: "Investors and operators who buy skilled nursing facilities.",
    problem: "Spotting a likely seller early means reading years of public filings, inspections and cost reports by hand.",
    market: [
      { text: "14,686 nursing homes were listed in the Centers for Medicare & Medicaid Services provider data as of its 1 October 2026 update.", source: { title: "CMS Provider Data Catalog, Nursing Homes: Provider Information", url: "https://data.cms.gov/provider-data/dataset/4pq5-n9py" } },
    ],
    others: "Brokers, paid healthcare data services, and analysts working from public filings by hand.",
    differs: "It scores every facility from public data and shows the signals behind each score.",
    potential: "Resume once the other ventures are live. Success looks like deals found before they reach the market.",
  },
];

export const TEAM = {
  israel: [
    { name: "Moshe Shimon" },
    { name: "Dan Kreisel" },
    { name: "Eliyahu Pereira" },
  ],
  us: [
    { name: "Ron Kreisel" },
    { name: "Ben Itzkowitz" },
  ],
};

// Filled when the owner sends the list of domains for the future pipeline.
export const PIPELINE = [];
