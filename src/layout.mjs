import fs from "node:fs";
import { SITE, NAV, STATUS } from "./site.mjs";
import { esc } from "./md.mjs";

export { esc };

const LOGO = fs.readFileSync(new URL("./logo-inline.svg", import.meta.url), "utf8")
  .replace("<svg ", '<svg class="logo" focusable="false" ');

export const CSS = `
@font-face{font-family:"Schibsted Grotesk";src:url(/assets/fonts/schibsted-grotesk.woff2) format("woff2");font-weight:400 900;font-display:swap}
@font-face{font-family:"IBM Plex Mono";src:url(/assets/fonts/ibm-plex-mono-500.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:"Great Vibes";src:url(/assets/fonts/great-vibes-show-you.woff2) format("woff2");font-weight:400;font-display:swap}
:root{--bg:#f6f8fa;--bg2:#eef2f6;--ink:#0d141f;--muted:#4a5566;--line:#d5dbe3;--aqua:#13707b;--navy:#0d141f;--navy2:#141e2c;--on-navy:#f1f5f9;--on-navy-muted:#a9b4c3;--aqua-hi:#6cc3cb;--good:#17683f;--warn:#8a5300;--hold:#5b6676;--sans:"Schibsted Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0b111a;--bg2:#111a26;--ink:#e8edf3;--muted:#a3adbb;--line:#253244;--aqua:#6cc3cb;--good:#5fd39a;--warn:#f0b44c;--hold:#9aa5b4}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 1.0625rem/1.6 var(--sans);overflow-x:hidden}
img,svg{max-width:100%}
a{color:var(--aqua);text-underline-offset:.18em}
a:hover{text-decoration-thickness:2px}
:focus-visible{outline:3px solid var(--aqua-hi);outline-offset:2px}
.wrap{max-width:1160px;margin:0 auto;padding:0 20px}
.skip{position:absolute;left:-999px;top:0;background:#fff;color:#000;padding:10px 14px;z-index:9}
.skip:focus{left:8px;top:8px}
.mono{font-family:var(--mono);font-weight:500;letter-spacing:.06em;text-transform:uppercase;font-size:.75rem}
h1,h2,h3{line-height:1.12;letter-spacing:-.02em;margin:0 0 .5em;font-weight:800}
h1{font-size:clamp(2.1rem,6.4vw,3.9rem)}
h2{font-size:clamp(1.6rem,3.6vw,2.4rem)}
h3{font-size:1.2rem;letter-spacing:-.01em}
p{margin:0 0 1em}
.lede{font-size:1.2rem;color:var(--muted);max-width:40em}
.top,.page-h,.cta-band{--good:#5fd39a;--warn:#f0b44c;--hold:#9aa5b4}
.top{background:var(--navy);color:var(--on-navy);--aqua:var(--aqua-hi)}
.bar{display:flex;align-items:center;gap:16px;min-height:64px}
.brand{display:block;color:var(--on-navy);line-height:0;margin-right:auto}
.logo{height:30px;width:auto;overflow:visible}
.nav{display:flex;gap:4px;align-items:center}
.nav a{color:var(--on-navy);text-decoration:none;padding:10px 10px;font-weight:600;font-size:.95rem}
.nav a:hover,.nav a[aria-current=page]{color:var(--aqua-hi)}
.btn{display:inline-flex;align-items:center;gap:.5em;min-height:46px;padding:0 20px;font:700 1rem var(--sans);text-decoration:none;border:2px solid var(--aqua);background:var(--aqua);color:#fff}
.top .btn,.btn.on-dark{background:var(--aqua-hi);border-color:var(--aqua-hi);color:var(--navy)}
.btn.ghost{background:transparent;color:inherit}
.btn:hover{filter:brightness(1.08)}
.menu{display:none}
.menu summary{list-style:none;cursor:pointer;padding:10px 12px;border:1px solid #33435a;font:600 .95rem var(--sans)}
.menu summary::-webkit-details-marker{display:none}
@media (max-width:860px){.nav,.bar>.btn{display:none}.menu{display:block;position:relative}.menu[open] .drop{position:absolute;right:0;top:calc(100% + 8px);background:var(--navy2);border:1px solid #33435a;min-width:220px;padding:8px;display:flex;flex-direction:column;z-index:5}.drop a{color:var(--on-navy);text-decoration:none;padding:12px;font-weight:600}.drop a:hover{color:var(--aqua-hi)}}
@media (min-width:861px){.drop{display:none}}
.hero{padding:56px 0 64px}
.hero-grid{display:grid;gap:40px}
@media (min-width:980px){.hero-grid{grid-template-columns:1.05fr .95fr;align-items:center}.hero{padding:80px 0 88px}}
.kicker{color:var(--aqua-hi);margin-bottom:18px}
.hero h1{color:var(--on-navy)}
.script{font-family:"Great Vibes",cursive;font-weight:400;color:var(--aqua-hi);font-size:1.22em;letter-spacing:0;line-height:.8}
.hero .lede{color:var(--on-navy-muted)}
.ctas{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 14px}
.fine{font-size:.9rem;color:var(--on-navy-muted)}
.screen{background:#fff;color:#0d141f;border:1px solid #2a3a50;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.screen-h{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid #e1e6ec;color:#4a5566}
.screen-h .tag{color:#9a3b00}
.row{padding:16px;border-bottom:1px solid #e1e6ec;display:grid;grid-template-columns:1fr auto;gap:6px 14px;align-items:start}
.row:last-child{border-bottom:0}
.row h3{font-size:1.02rem;margin:0}
.row p{margin:0;color:#4a5566;font-size:.9rem;grid-column:1/-1}
.pill{font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;padding:4px 8px;border:1px solid currentColor;white-space:nowrap}
.pill.wait{color:#8a5300}.pill.live{color:#17683f}.pill.held{color:#5b6676}
.acts{grid-column:1/-1;display:flex;gap:8px;margin-top:6px}
.acts span{font:700 .85rem var(--sans);padding:8px 14px;border:2px solid #13707b}
.acts span:first-child{background:#13707b;color:#fff}
.chk{width:18px;height:18px;vertical-align:-3px;margin-right:4px}
.chk path{fill:none;stroke:#17683f;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
section{padding:72px 0;border-top:1px solid var(--line)}
section.alt{background:var(--bg2)}
.sec-h{max-width:46em;margin-bottom:32px}
.sec-h .mono{color:var(--aqua);display:block;margin-bottom:10px}
.steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,1fr);border-top:2px solid var(--ink)}
@media (min-width:700px){.steps{grid-template-columns:repeat(3,1fr)}}
@media (min-width:1040px){.steps{grid-template-columns:repeat(6,1fr)}}
.steps li{padding:18px 16px 20px 0;border-bottom:1px solid var(--line)}
.steps b{display:block;font-size:1.1rem;margin:6px 0 4px}
.steps .mono{color:var(--aqua)}
.steps span:last-child{color:var(--muted);font-size:.95rem}
.vlist{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.vlist li{border-bottom:1px solid var(--line)}
.vlist a.v{display:grid;grid-template-columns:1fr;gap:6px 24px;padding:22px 0;color:inherit;text-decoration:none}
@media (min-width:800px){.vlist a.v{grid-template-columns:220px 1fr 150px;align-items:baseline}}
.vlist .nm{font-size:1.35rem;font-weight:800;letter-spacing:-.01em}
.vlist .ln{color:var(--muted)}
.vlist .go{color:var(--aqua);font-weight:700}
.vlist a.v:hover .nm{color:var(--aqua)}
.status{font-family:var(--mono);font-weight:500;font-size:.72rem;letter-spacing:.08em;display:inline-block;padding:3px 8px;border:1px solid currentColor;margin-right:10px;vertical-align:3px}
.status.good{color:var(--good)}.status.warn{color:var(--warn)}.status.muted{color:var(--hold)}
.facts{display:grid;gap:0;border-top:2px solid var(--ink);margin:0}
@media (min-width:800px){.facts{grid-template-columns:repeat(3,1fr)}}
.facts div{padding:20px 20px 20px 0;border-bottom:1px solid var(--line)}
.facts dt{color:var(--muted)}
.facts dd{margin:6px 0 0;font-size:1.6rem;font-weight:800}
.ph{font-family:var(--mono);font-weight:500;background:rgba(240,180,76,.18);padding:0 .25em;border-bottom:2px dashed var(--warn)}
.cols{display:grid;gap:32px}
@media (min-width:860px){.cols{grid-template-columns:1fr 1fr}}
.rules{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.rules li{padding:18px 0;border-bottom:1px solid var(--line)}
.rules b{display:block;font-size:1.1rem}
.rules span{color:var(--muted)}
.empty{border:1px dashed var(--line);padding:28px;color:var(--muted)}
.cta-band{background:var(--navy);color:var(--on-navy);--aqua:var(--aqua-hi);border-top:0}
.cta-band p{color:var(--on-navy-muted)}
footer{background:var(--navy);color:var(--on-navy-muted);padding:44px 0 36px;border-top:1px solid #223047;--aqua:var(--aqua-hi)}
footer .logo{height:26px;color:var(--on-navy)}
.foot{display:grid;gap:24px}
@media (min-width:800px){.foot{grid-template-columns:1.3fr 1fr 1fr}}
footer a{color:var(--on-navy);text-decoration:none}
footer a:hover{color:var(--aqua-hi)}
footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.legal{margin-top:28px;font-size:.85rem}
.page-h{background:var(--navy);color:var(--on-navy);padding:48px 0 52px;--aqua:var(--aqua-hi)}
.page-h .lede{color:var(--on-navy-muted)}
.page-h .mono{color:var(--aqua-hi);display:block;margin-bottom:12px}
.crumbs{font-size:.9rem;margin-bottom:14px}
.crumbs a{color:var(--on-navy-muted)}
.prose{max-width:42rem}
.prose h2{font-size:1.6rem;margin-top:1.6em}
.prose h3{margin-top:1.4em}
.prose li{margin-bottom:.4em}
.prose blockquote{margin:1.2em 0;padding-left:16px;border-left:3px solid var(--aqua)}
.prose code{font-family:var(--mono);font-size:.9em;background:var(--bg2);padding:0 .25em}
.vsec{display:grid;gap:8px 40px;padding:28px 0;border-bottom:1px solid var(--line)}
@media (min-width:860px){.vsec{grid-template-columns:240px 1fr}}
.vsec h2{font-size:1.15rem;margin:0}
.vsec p:last-child{margin-bottom:0}
.src{font-size:.9rem;color:var(--muted)}
.people{list-style:none;margin:0 0 40px;padding:0;display:grid;gap:0;border-top:2px solid var(--ink)}
@media (min-width:700px){.people{grid-template-columns:repeat(2,1fr)}}
.people li{display:flex;gap:16px;align-items:center;padding:18px 16px 18px 0;border-bottom:1px solid var(--line)}
.mg{flex:none;width:56px;height:56px;display:grid;place-items:center;background:var(--navy);color:var(--aqua-hi);font:800 1.15rem var(--sans);letter-spacing:.02em}
.people b{display:block;font-size:1.1rem}
.people span{color:var(--muted);font-size:.95rem}
.posts{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.posts li{padding:22px 0;border-bottom:1px solid var(--line)}
.posts a{font-size:1.3rem;font-weight:800;text-decoration:none;color:inherit}
.posts a:hover{color:var(--aqua)}
.meta{color:var(--muted);font-size:.9rem}
@media (prefers-reduced-motion:no-preference){
.home .brand .s{stroke-dasharray:1;stroke-dashoffset:1;animation:aq-draw .9s .15s ease-out forwards}
.home .brand .s:nth-of-type(2){animation-delay:.75s;animation-duration:.4s}
.home .brand g+path~g .s{animation-delay:.5s}
.hero .rise{opacity:0;animation:aq-rise .6s ease-out forwards}
.hero .r2{animation-delay:.12s}.hero .r3{animation-delay:.24s}.hero .r4{animation-delay:.36s}
.screen .row{opacity:0;animation:aq-rise .5s ease-out forwards}
.screen .row:nth-child(2){animation-delay:.5s}.screen .row:nth-child(3){animation-delay:.8s}.screen .row:nth-child(4){animation-delay:1.1s}
.chk path{stroke-dasharray:1;stroke-dashoffset:1;animation:aq-draw .5s 1.5s ease-out forwards}
}
@keyframes aq-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes aq-draw{to{stroke-dashoffset:0}}
`;

export function statusTag(key) {
  const s = STATUS[key];
  return `<span class="status ${s.tone}">${s.label}</span>`;
}

export function ph(text) {
  return /^\[[A-Z ]+\]$/.test(text) ? `<span class="ph" title="Waiting for the owner">${esc(text)}</span>` : esc(text);
}

function header(path) {
  const links = NAV.map((n) => `<a href="${n.href}"${path === n.href ? ' aria-current="page"' : ""}>${n.label}</a>`).join("");
  return `<header class="top"><div class="wrap bar">
<a class="brand" href="/" aria-label="AgentiQly.io home">${LOGO}</a>
<nav class="nav" aria-label="Main">${links}</nav>
<a class="btn" href="mailto:${SITE.email}">Talk to Moshe</a>
<details class="menu"><summary aria-label="Open menu">Menu</summary><nav class="drop" aria-label="Main">${links}<a href="mailto:${SITE.email}">Talk to Moshe</a></nav></details>
</div></header>`;
}

function footer() {
  const year = new Date().getUTCFullYear();
  return `<footer><div class="wrap">
<div class="foot">
<div><a href="/" aria-label="AgentiQly.io home" style="line-height:0;display:inline-block">${LOGO}</a><p style="margin-top:14px">${esc(SITE.footerLine)}.<br>Israel and the United States.</p></div>
<ul>${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}</ul>
<ul><li><a href="mailto:${SITE.email}">${SITE.email}</a></li><li><a href="/blog/rss.xml">Blog feed (RSS)</a></li></ul>
</div>
<p class="legal">© ${year} AgentiQly.io</p>
</div></footer>`;
}

export function page({ path, title, description, body, bodyClass = "", jsonld = null, ogType = "website", preview = false }) {
  const url = SITE.url + path;
  const fullTitle = title === SITE.title ? title : `${title} · AgentiQly.io`;
  const ld = jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${preview ? "noindex,nofollow" : "index,follow,max-image-preview:large"}">
<meta name="theme-color" content="#0d141f">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="AgentiQly.io">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE.url}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AgentiQly.io logo on navy">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="AgentiQly.io blog" href="/blog/rss.xml">
<link rel="preload" href="/assets/fonts/schibsted-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS.replace(/\n/g, "")}</style>
${ld}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}
