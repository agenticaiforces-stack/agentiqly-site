// Builds the static site into dist/. No dependencies: `node build.mjs`.
// PREVIEW=1 marks every page noindex and blocks crawlers (for preview links).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, VENTURES, TEAM, PIPELINE, STATUS } from "./src/site.mjs";
import { page, statusTag, ph, esc } from "./src/layout.mjs";
import { markdown, parsePost, readingMinutes, inline } from "./src/md.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.env.OUT_DIR || path.join(ROOT, "dist"));
const PREVIEW = process.env.PREVIEW === "1";
const pages = [];

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function addPage(urlPath, opts, lastmod = null) {
  const rel = urlPath.endsWith("/") ? urlPath + "index.html" : urlPath;
  write(rel, page({ ...opts, path: urlPath, preview: PREVIEW }));
  if (!opts.noSitemap) pages.push({ loc: SITE.url + urlPath, lastmod });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function fmtDate(iso) {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function loadPosts(dir) {
  if (!fs.existsSync(dir)) return [];
  const posts = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".md") && !n.startsWith("_") && n.toLowerCase() !== "readme.md")) {
    const { meta, body } = parsePost(fs.readFileSync(path.join(dir, f), "utf8"));
    if (meta.draft === true) continue;
    if (!meta.title) throw new Error(`${f}: missing title`);
    const slug = String(meta.slug || f.replace(/\.md$/, "")).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const date = typeof meta.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(meta.date) ? meta.date.slice(0, 10) : null;
    posts.push({ ...meta, slug, date, body, file: f });
  }
  return posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

// ---------- home ----------
function home(posts) {
  const steps = [
    ["Listens", "Real questions from your customers."],
    ["Researches", "Every fact from a page it read."],
    ["Drafts", "In the method of a named writer."],
    ["Checks", "Five ways before you see it."],
    ["Waits for your yes", "Or posts on its own, if you allow it."],
    ["Learns", "What you reject stops coming back."],
  ];
  const ventures = VENTURES.map((v) => `<li><a class="v" href="/ventures/${v.slug}/">
<span class="nm">${esc(v.name)}</span>
<span class="ln">${statusTag(v.status)}${esc(v.line)}${v.note ? ` <em>${esc(v.note)}</em>` : ""}</span>
<span class="go">Profile →</span></a></li>`).join("\n");
  const latest = posts.slice(0, 3);
  const blog = latest.length
    ? `<ul class="posts">${latest.map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a><div class="meta">${p.date ? fmtDate(p.date) : ""}</div></li>`).join("")}</ul>`
    : `<p class="empty">First posts coming soon. Each one answers a question someone really asked, with its sources listed underneath.</p>`;
  const pipeline = PIPELINE.length
    ? `<ul class="vlist">${PIPELINE.map((p) => `<li><span class="v"><span class="nm">${esc(p.name)}</span><span class="ln">${esc(p.line || "")}</span></span></li>`).join("")}</ul>`
    : `<p class="empty">The next ventures will be listed here once they are chosen. Nothing is announced before there is a domain and a plan.</p>`;

  const body = `
<div class="top hero"><div class="wrap hero-grid">
<div>
<p class="mono kicker rise">${esc(SITE.kicker)}</p>
<h1 class="rise r2">We build AI products, run them on our own businesses, and <span class="script">show you</span> what happened.</h1>
<p class="lede rise r3">Each venture is built as a company that can grow, raise money and one day be sold. Before it's offered to anyone, it has to work on a real business.</p>
<div class="ctas rise r4"><a class="btn on-dark" href="#ventures">See the ventures →</a><a class="btn ghost" href="#proof">How we prove results</a></div>
<p class="fine rise r4">Nothing goes live without a person's yes.</p>
</div>
<figure class="screen" style="margin:0" aria-label="Example screen with invented data: the content engine's morning queue">
<div class="screen-h mono"><span>Content engine · this morning</span><span class="tag">Example screen · invented data</span></div>
<div class="row"><h3>How to read a carrier's denial letter, line by line</h3><span class="pill wait">WAITING FOR YOU</span>
<p>Asked 23 times in chat this month · step-by-step guide · writer: reason-why method</p>
<div class="acts" aria-hidden="true"><span>Approve</span><span>Ask for a change</span></div></div>
<div class="row"><h3>Can a renewal price go up without notice?</h3><span class="pill live"><svg class="chk" viewBox="0 0 20 20" aria-hidden="true"><path pathLength="1" d="M4 10.5l4 4 8-9"/></svg>WENT LIVE 6:02 AM</span>
<p>FAQ answer · 3 sentences · indexed</p></div>
<div class="row"><h3>The history of the insurance adjuster</h3><span class="pill held">HELD</span>
<p>Needs original sources before writing</p></div>
</figure>
</div></div>

<section id="how"><div class="wrap">
<div class="sec-h"><span class="mono">How every product works</span><h2>Six steps, and a person decides the one that matters.</h2></div>
<ol class="steps">${steps.map(([t, d], i) => `<li><span class="mono">0${i + 1}</span><b>${t}</b><span>${d}</span></li>`).join("")}</ol>
</div></section>

<section id="ventures" class="alt"><div class="wrap">
<div class="sec-h"><span class="mono">Ventures · status as of ${ph(SITE.studioLogAsOf)}</span><h2>What we are building, and where each one stands.</h2>
<p class="lede">Two products are in beta with real users, one runs on our own sites, the rest are being built. The labels say which.</p></div>
<ul class="vlist">${ventures}</ul>
</div></section>

<section id="proof"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">Track record</span><h2>We test on ourselves first, and publish the numbers.</h2></div>
<p>Our own sites are the test bed. Before we changed anything, we took screenshots and speed readings of every one of them. That is Day 0.</p>
<p>From then on we track search visits, appearances in AI answers and phone speed, and publish a report every month. The bad months stay in.</p></div>
<dl class="facts" style="align-self:start">
<div><dt>Proof program started</dt><dd>${ph(SITE.programStart)}</dd></div>
<div><dt>Day 0 recorded</dt><dd>6 sites</dd></div>
<div><dt>First monthly report</dt><dd>${ph(SITE.firstReport)}</dd></div>
</dl>
</div></section>

<section class="alt"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">How we build</span><h2>Four rules every product follows.</h2></div></div>
<ul class="rules">
<li><b>Proven on a real business first.</b><span>A product has to work for a real business, ours or a first client's, before anyone else pays for it.</span></li>
<li><b>Every fact has a source.</b><span>If we can't show where a figure came from, it doesn't go out.</span></li>
<li><b>A person says yes.</b><span>Nothing publishes, sends or spends without approval, unless the business owner chooses to let it post on its own.</span></li>
<li><b>Results in the open.</b><span>What worked, what didn't, with the raw numbers.</span></li>
</ul>
</div></section>

<section id="pipeline"><div class="wrap">
<div class="sec-h"><span class="mono">Pipeline</span><h2>What comes next.</h2></div>
${pipeline}
</div></section>

<section id="blog" class="alt"><div class="wrap">
<div class="sec-h"><span class="mono">Blog</span><h2>Notes from the studio.</h2></div>
${blog}
<p style="margin-top:20px"><a href="/blog/">All posts →</a></p>
</div></section>

<section id="businesses" class="alt"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">For businesses</span><h2>Need an AI app for your own business?</h2></div>
<p>We build custom apps and agents for the jobs that eat your week: answering customers, paperwork, deadlines. A written plan first, tested on your real work.</p></div>
<p style="align-self:center"><a class="btn" href="/build/">How we build for businesses →</a></p>
</div></section>

<section id="founders" class="cta-band" aria-labelledby="founders-title"><div class="wrap">
<p class="mono kicker">For founders</p>
<h2 id="founders-title">Know a market from the inside?</h2>
<p class="lede">We're choosing the next ventures. Tell us the problem and who has it. Your idea stays yours until we've talked and signed an NDA.</p>
<a class="btn on-dark" href="/apply/">How to apply</a>
</div></section>`;

  return {
    title: SITE.title,
    description: SITE.description,
    body,
    bodyClass: "home",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AgentiQly.io",
      url: SITE.url + "/",
      logo: SITE.url + "/assets/brand/logo-light.svg",
      email: SITE.email,
      description: SITE.description,
    },
  };
}

// ---------- team ----------
function team() {
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const group = (label, list) =>
    `<h2>${label}</h2><ul class="people">${list.map((p) =>
      `<li><span class="mg" aria-hidden="true">${initials(p.name)}</span><span><b>${esc(p.name)}</b></span></li>`
    ).join("")}</ul>`;
  return {
    title: "Team",
    description: "The people behind AgentiQly.io, a joint Israeli–US AI agentic startup incubator, with teams in Israel and the United States.",
    body: `<div class="page-h"><div class="wrap"><span class="mono">Team</span><h1>Two teams, one studio.</h1><p class="lede">AgentiQly.io is run by a team in Israel and a team in the United States.</p></div></div>
<section style="border-top:0"><div class="wrap">${group("Israel", TEAM.israel)}${group("United States", TEAM.us)}</div></section>`,
  };
}

// ---------- apply (owner, 15 Nov 2026) ----------
// Founders never have to send the idea itself: the first email is the problem and the market only.
function apply() {
  const mail = `mailto:${SITE.email}?subject=Apply%3A%20building%20a%20startup`;
  return {
    title: "Build your startup with us",
    description: "Founders who know a market from the inside can apply to build an AI startup with AgentiQly.io. You never send the idea itself to apply, and details come only after a signed NDA.",
    body: `<div class="page-h"><div class="wrap"><span class="mono">For founders</span><h1>Build your startup with us.</h1>
<p class="lede">You know a market from the inside: the problem, who has it, and what they pay to live with it. We build AI products, prove them on a real business first, and publish what happened. You don't have to hand over your idea to find out if we're a fit.</p></div></div>
<section style="border-top:0"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">Your idea stays yours</span><h2>Tell us the problem. Keep the answer until we've talked.</h2></div>
<p>Your first email covers the problem and the market, nothing more. Don't send how you'd solve it, how it works, or anything you'd mind a stranger reading.</p>
<p>If we both want to go further, we talk first. Before you share any details, we both sign an NDA (a mutual non-disclosure agreement).</p></div>
<ul class="rules">
<li><b>Read by the founding team only.</b><span>Applications are not shared outside AgentiQly.io.</span></li>
<li><b>No details until there's a signed NDA.</b><span>The how comes after a call and a signed NDA, never in the first email.</span></li>
<li><b>We don't build a submitted idea without its founder.</b><span>If we pass, we say so and why. The idea goes back to you.</span></li>
</ul>
</div></section>
<section class="alt"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">Who it's for</span><h2>Founders with a real problem, not a pitch deck.</h2></div>
<p>The best ventures start with someone who has done the work and seen the problem up close. Technical skills are welcome but not required. Knowing the customer is.</p></div>
<ul class="rules">
<li><b>A problem you have seen first-hand.</b><span>Who has it, how often, and what it costs them today.</span></li>
<li><b>A way to reach the first customers.</b><span>A market you can name, and people in it who would take your call.</span></li>
<li><b>Patience for proof.</b><span>We build, run it on a real business, and measure before anyone else pays.</span></li>
</ul>
</div></section>
<section><div class="wrap">
<div class="sec-h"><span class="mono">How it works</span><h2>Four steps, and an honest answer at each one.</h2></div>
<ol class="steps">
<li><span class="mono">01</span><b>You describe the problem</b><span>A short email about the problem and the market. Not the solution.</span></li>
<li><span class="mono">02</span><b>We talk</b><span>If it fits, a call. If it doesn't, we say so and why.</span></li>
<li><span class="mono">03</span><b>We sign an NDA before the details</b><span>Then the terms in writing: who does what, who owns what, what success looks like.</span></li>
<li><span class="mono">04</span><b>We build and prove it</b><span>On a real business first, with the numbers published, the bad months included.</span></li>
</ol>
</div></section>
<section class="alt"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">Apply</span><h2>What to send.</h2></div>
<p>Email <a href="${mail}">${esc(SITE.email)}</a> with the subject "Apply". A few lines on each is plenty.</p></div>
<ol class="rules">
<li><b>The problem.</b><span>What goes wrong, for whom, and how often.</span></li>
<li><b>What it costs them today.</b><span>Money, time or customers lost, and what they pay to work around it.</span></li>
<li><b>Why you.</b><span>Your experience in this market, in a sentence or two.</span></li>
<li><b>Where you are.</b><span>Israel, the US, or both.</span></li>
</ol>
</div></section>
<section class="cta-band"><div class="wrap">
<h2>Know a market from the inside?</h2>
<p class="lede">Problem and market only. We read every application and reply to each one.</p>
<a class="btn on-dark" href="${mail}">Apply by email</a>
<p class="small">Want an app for your own business instead? <a href="/build/">See how we build for businesses</a>.</p>
</div></section>`,
  };
}

// ---------- build for your business (owner, 15 Nov 2026): client work, the studio's main business ----------
function buildForYou() {
  const mail = `mailto:${SITE.email}?subject=Build%3A%20an%20app%20for%20my%20business`;
  const faq = [
    ["Do I need to know anything technical?", "No. You tell us how the work gets done today and what goes wrong. We turn that into a written plan in plain language, and you approve it before we build."],
    ["Who owns what you build?", "It is agreed in writing before work starts, so there are no surprises later."],
    ["Can it work with the tools we already use?", "Usually, yes. Email, spreadsheets, your store, your booking or accounting system: we list what it connects to in the plan, and say plainly if something can't be connected."],
    ["Will it act on its own?", "Only if you want it to. By default nothing sends, publishes or spends money without a person saying yes."],
    ["How do I know it worked?", "We agree what success means before we start, such as hours saved or orders answered, and measure it after launch."],
  ];
  return {
    title: "Custom AI apps and agents for your business",
    description: "AgentiQly.io builds custom AI apps and agents for a business's own work: answering customers, handling paperwork, tracking deadlines. A written plan first, tested on your real work.",
    body: `<div class="page-h"><div class="wrap"><span class="mono">For businesses</span><h1>An AI app built for how your business works.</h1>
<p class="lede">Not a product for the market. A tool for your business: the questions you answer every day, the paperwork that piles up, the deadlines that slip. We build it, test it on your real work, and you decide what it's allowed to do.</p>
<div class="ctas"><a class="btn on-dark" href="${mail}">Tell us what slows you down</a></div></div></div>
<section style="border-top:0"><div class="wrap cols">
<div><div class="sec-h"><span class="mono">What we build</span><h2>The jobs that eat your week.</h2></div>
<p>Our own products started this way. AdjusterOS Pro began as a tool we built for one adjuster's business. Our sales agent is in beta with a US printer serving a specialist niche.</p></div>
<ul class="rules">
<li><b>Answering customers.</b><span>Sizes, stock, order status, the same twenty questions, answered on your site, with anything it can't confirm sent to a person.</span></li>
<li><b>Paperwork and documents.</b><span>Reading forms, emails and PDFs, pulling out what matters, and filing it where it belongs.</span></li>
<li><b>Deadlines and follow-ups.</b><span>Renewals, claims, quotes and reminders tracked in one place, so nothing slips.</span></li>
<li><b>Reports you'd never have time to read.</b><span>What changed, what it cost, and what to check next, with the source of every figure.</span></li>
</ul>
</div></section>
<section class="alt"><div class="wrap">
<div class="sec-h"><span class="mono">How it works</span><h2>A written plan before any work, and you approve every step.</h2></div>
<ol class="steps">
<li><span class="mono">01</span><b>A first call</b><span>You walk us through how the work gets done today and where it goes wrong.</span></li>
<li><span class="mono">02</span><b>A written plan and price</b><span>What it will do, what it connects to, what success looks like, and what it costs, before any work starts.</span></li>
<li><span class="mono">03</span><b>Built and tested on your real work</b><span>You try it on real cases and tell us what's wrong while it's still being built.</span></li>
<li><span class="mono">04</span><b>Live, and measured</b><span>It goes live when you say so, and we check it against what we agreed.</span></li>
</ol>
</div></section>
<section><div class="wrap cols">
<div><div class="sec-h"><span class="mono">Questions</span><h2>Before you get in touch.</h2></div></div>
<dl class="rules">${faq.map(([q, a]) => `<div><dt><b>${esc(q)}</b></dt><dd>${esc(a)}</dd></div>`).join("")}</dl>
</div></section>
<section class="cta-band"><div class="wrap">
<h2>What would you hand off first?</h2>
<p class="lede">Email <a href="${mail}">${esc(SITE.email)}</a> with the subject "Build": what your business does, the job that takes too long, and the tools you use for it now. We reply to every message.</p>
<a class="btn on-dark" href="${mail}">Start with an email</a>
</div></section>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Service", name: "Custom AI apps and agents for businesses", provider: { "@type": "Organization", name: "AgentiQly.io", url: SITE.url + "/" }, url: SITE.url + "/build/", areaServed: ["US", "IL"] },
        { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ],
    },
  };
}

// ---------- ventures ----------
function venture(v) {
  const s = STATUS[v.status];
  if (v.private) return privateVenture(v, s);
  const market = v.market.length
    ? v.market.map((m) => `<p>${esc(m.text)}</p><p class="src">Source: <a href="${esc(m.source.url)}" rel="noopener">${esc(m.source.title)}</a></p>`).join("")
    : `<p>We haven't published a sourced figure for this market yet. We'd rather show none than a guess.</p>`;
  const rows = [
    ...(v.started ? [["How it started", `<p>${esc(v.started)}</p>`]] : []),
    ["Who it's for", `<p>${esc(v.customer)}</p>`],
    ["The problem", `<p>${esc(v.problem)}</p>`],
    ["The market", market],
    ["What people use today", `<p>${esc(v.others)}</p>`],
    ["How it's different", `<p>${esc(v.differs)}</p>`],
    ["Where it's going", `<p>${esc(v.potential)}</p>`],
  ];
  return {
    title: `${v.name}: ${s.label.toLowerCase()}`,
    description: v.line,
    body: `<div class="page-h"><div class="wrap"><p class="crumbs"><a href="/#ventures">Ventures</a> / ${esc(v.name)}</p>
<span class="mono">${statusTag(v.status)}</span><h1>${esc(v.name)}</h1><p class="lede">${esc(v.line)}</p>
${v.site ? `<p><a href="${esc(v.site)}" rel="noopener" style="color:var(--aqua-hi)">${esc(v.site.replace(/^https?:\/\//, ""))} →</a></p>` : ""}</div></div>
<section style="border-top:0;padding-top:24px"><div class="wrap">${rows.map(([h, b]) => `<div class="vsec"><h2>${h}</h2><div>${b}</div></div>`).join("")}
<p style="margin-top:28px"><a href="/#ventures">← All ventures</a></p></div></section>`,
  };
}

// Private ventures show only the name, status, one line and a link.
function privateVenture(v, s) {
  return {
    title: `${v.name}: ${s.label.toLowerCase()}`,
    description: `${v.name}, an AgentiQly.io venture. ${v.line}`,
    body: `<div class="page-h"><div class="wrap"><p class="crumbs"><a href="/#ventures">Ventures</a> / ${esc(v.name)}</p>
<span class="mono">${statusTag(v.status)}</span><h1>${esc(v.name)}</h1><p class="lede">${esc(v.line)}</p>
<p><a href="${esc(v.site)}" rel="noopener" style="color:var(--aqua-hi)">${esc(v.site.replace(/^https?:\/\//, ""))} →</a></p>
<p style="margin-top:28px"><a href="/#ventures">← All ventures</a></p></div></div>`,
  };
}

function venturesIndex() {
  return {
    title: "Ventures",
    description: "Every AgentiQly.io venture and where it stands: in beta, on our own sites, pre-launch, in build or on hold.",
    body: `<div class="page-h"><div class="wrap"><span class="mono">Ventures · status as of ${ph(SITE.studioLogAsOf)}</span><h1>Ventures</h1><p class="lede">What we are building, and where each one stands. Two products are in beta with real users, one runs on our own sites, the rest are being built. The labels say which.</p></div></div>
<section style="border-top:0"><div class="wrap"><ul class="vlist">${VENTURES.map((v) => `<li><a class="v" href="/ventures/${v.slug}/"><span class="nm">${esc(v.name)}</span><span class="ln">${statusTag(v.status)}${esc(v.line)}</span><span class="go">Profile →</span></a></li>`).join("")}</ul></div></section>`,
  };
}

// ---------- blog ----------
function blogIndex(posts) {
  const list = posts.length
    ? `<ul class="posts">${posts.map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a>${p.description ? `<p style="margin:6px 0 0">${esc(p.description)}</p>` : ""}<div class="meta">${p.date ? fmtDate(p.date) + " · " : ""}${readingMinutes(p.body)} min read</div></li>`).join("")}</ul>`
    : `<p class="empty">First posts coming soon. Each one answers a question someone really asked, with its sources listed underneath. <a href="/blog/rss.xml">Follow the feed</a> to get them when they're out.</p>`;
  return {
    title: "Blog",
    description: "Notes from AgentiQly.io: what we built, how it went on our own businesses, and the numbers behind it.",
    body: `<div class="page-h"><div class="wrap"><span class="mono">Blog</span><h1>Notes from the studio.</h1><p class="lede">What we built, how it went on our own businesses, and the numbers behind it.</p></div></div>
<section style="border-top:0"><div class="wrap">${list}</div></section>`,
  };
}

function article(p, kind) {
  const base = kind === "guide" ? "/guides/" : "/blog/";
  const sources = Array.isArray(p.sources) && p.sources.length
    ? `<h2>Sources</h2><ol>${p.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title || s.url)}</a></li>`).join("")}</ol>` : "";
  const faq = Array.isArray(p.faq) && p.faq.length
    ? `<h2>Questions people ask</h2>${p.faq.map((f) => `<h3>${esc(f.q || f.question)}</h3><p>${inline(f.a || f.answer || "")}</p>`).join("")}` : "";
  const ld = [{
    "@context": "https://schema.org",
    "@type": kind === "guide" ? "Article" : "BlogPosting",
    headline: p.title,
    description: p.description || undefined,
    datePublished: p.date || undefined,
    dateModified: p.updated || p.date || undefined,
    mainEntityOfPage: SITE.url + base + p.slug + "/",
    author: { "@type": "Organization", name: "AgentiQly.io", url: SITE.url + "/" },
    publisher: { "@type": "Organization", name: "AgentiQly.io", url: SITE.url + "/" },
  }];
  if (faq) ld.push({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q || f.question, acceptedAnswer: { "@type": "Answer", text: f.a || f.answer } })),
  });
  return {
    title: p.title,
    description: p.description || SITE.description,
    ogType: "article",
    jsonld: ld,
    body: `<div class="page-h"><div class="wrap"><p class="crumbs"><a href="${base}">${kind === "guide" ? "Guides" : "Blog"}</a></p><h1 style="max-width:22em">${esc(p.title)}</h1>
<p class="meta" style="color:var(--on-navy-muted)">${p.date ? `<time datetime="${p.date}">${fmtDate(p.date)}</time> · ` : ""}${readingMinutes(p.body)} min read</p></div></div>
<section style="border-top:0"><div class="wrap"><article class="prose">${markdown(p.body)}${faq}${sources}</article>
<p style="margin-top:32px"><a href="${base}">← All ${kind === "guide" ? "guides" : "posts"}</a></p></div></section>`,
  };
}

function rss(posts) {
  const items = posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/blog/${p.slug}/</link><guid>${SITE.url}/blog/${p.slug}/</guid>${p.date ? `<pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate>` : ""}<description>${esc(p.description || "")}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>AgentiQly.io blog</title><link>${SITE.url}/blog/</link><description>${esc(SITE.description)}</description><language>en</language>${items}</channel></rss>\n`;
}

function redirectStub(to) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page moved to <a href="${to}">${SITE.url}${to}</a>.</p></body></html>\n`;
}

// ---------- run ----------
export function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
  // Policy pages and security.txt, rendered from the shared AgentiQly.io templates (agentiqly-hq tools/policies).
  copyDir(path.join(ROOT, "static"), OUT);
  for (const f of ["favicon.svg"]) fs.copyFileSync(path.join(ROOT, "assets/brand", f), path.join(OUT, f));
  for (const f of ["og.png", "favicon-32.png", "apple-touch-icon.png"]) {
    const src = path.join(ROOT, "assets/brand", f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
  }
  // The email signature links these two images at the site root.
  for (const f of ["agentiqly-logo.jpg", "agentiqly-logo-new.jpg"]) fs.copyFileSync(path.join(ROOT, "assets/brand", f), path.join(OUT, f));

  const posts = loadPosts(path.join(ROOT, "content/blog"));
  const guides = loadPosts(path.join(ROOT, "content/guides"));

  addPage("/", home(posts));
  addPage("/team/", team());
  addPage("/apply/", apply());
  addPage("/build/", buildForYou());
  addPage("/ventures/", venturesIndex());
  for (const v of VENTURES) addPage(`/ventures/${v.slug}/`, venture(v));
  addPage("/blog/", blogIndex(posts));
  for (const p of posts) addPage(`/blog/${p.slug}/`, article(p, "post"), p.updated || p.date);
  for (const g of guides) addPage(`/guides/${g.slug}/`, article(g, "guide"), g.updated || g.date);
  write("404.html", page({ path: "/404.html", title: "Page not found", description: "This page doesn't exist on agentiqly.io. It may have moved when the site was rebuilt.", preview: true,
    body: `<div class="page-h"><div class="wrap"><span class="mono">404</span><h1>That page isn't here.</h1><p class="lede">It may have moved when we rebuilt the site.</p><p><a class="btn on-dark" href="/">Go to the home page</a></p></div></div>` }));

  const moved = { "about.html": "/#how", "projects.html": "/#ventures", "case-studies.html": "/#proof", "team.html": "/team/", "index.html": null };
  // Netlify previews serve team.html for /team/ when both exist, so previews use _redirects instead of stub pages.
  if (PREVIEW) write("_redirects", Object.entries(moved).filter(([, to]) => to).map(([from, to]) => `/${from} ${to} 301`).join("\n") + "\n");
  else for (const [from, to] of Object.entries(moved)) if (to) write(from, redirectStub(to));

  write("blog/rss.xml", rss(posts));
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `<url><loc>${p.loc}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
  write("robots.txt", PREVIEW ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  return { pages: pages.length, posts: posts.length, guides: guides.length, out: OUT };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = build();
  console.log(`built ${r.pages} pages (${r.posts} posts, ${r.guides} guides) into ${r.out}${PREVIEW ? " [preview: noindex]" : ""}`);
}
