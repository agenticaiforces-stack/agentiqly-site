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

<section id="founders" class="cta-band" aria-labelledby="founders-title"><div class="wrap">
<p class="mono kicker">For founders</p>
<h2 id="founders-title">Know a market from the inside?</h2>
<p class="lede">We're choosing the next ventures. Tell us the problem, who has it and what they pay to deal with it today. If we can't build it well, we'll say so.</p>
<a class="btn on-dark" href="mailto:${SITE.email}">Talk to Moshe</a>
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

// ---------- ventures ----------
function venture(v) {
  const s = STATUS[v.status];
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
