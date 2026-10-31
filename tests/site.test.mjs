import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { markdown, parsePost, inline } from "../src/md.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), "aqsite-"));
execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, env: { ...process.env, OUT_DIR: OUT } });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const htmlFiles = walk(OUT).filter((f) => f.endsWith(".html"));
const realPages = htmlFiles.filter((f) => !/http-equiv="refresh"/.test(fs.readFileSync(f, "utf8")));

test("every real page has title, description, canonical, og tags and one h1", () => {
  for (const f of realPages) {
    const h = fs.readFileSync(f, "utf8");
    const rel = path.relative(OUT, f);
    assert.match(h, /<title>[^<]{5,}<\/title>/, rel);
    assert.match(h, /<meta name="description" content="[^"]{30,}">/, rel);
    assert.match(h, /<link rel="canonical" href="https:\/\/www\.agentiqly\.io\//, rel);
    assert.match(h, /<meta property="og:image" content="https:\/\/www\.agentiqly\.io\/og\.png">/, rel);
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, `${rel} h1 count`);
    assert.match(h, /<html lang="en">/, rel);
  }
});

test("removed old material never appears", () => {
  const banned = [/claw/i, /r\.f\.v\.p/i, /hipaa/i, /enterprise[- ]ready/i, /classified/i, /testimonial/i, /trusted by/i, /compuchecks/i, /certified/i, /soc ?2/i];
  for (const f of realPages) {
    const text = fs.readFileSync(f, "utf8");
    for (const b of banned) assert.doesNotMatch(text, b, `${path.relative(OUT, f)} contains ${b}`);
  }
});

test("internal links and assets resolve", () => {
  for (const f of htmlFiles) {
    const h = fs.readFileSync(f, "utf8");
    for (const [, href] of h.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const target = href.endsWith("/") ? path.join(OUT, href, "index.html") : path.join(OUT, href);
      assert.ok(fs.existsSync(target), `${path.relative(OUT, f)} -> ${href}`);
    }
  }
});

test("owner dates show and no placeholder is left", () => {
  const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
  assert.match(home, /status as of 30 October 2026/);
  assert.match(home, /<dd>30 October 2026<\/dd>/);
  assert.match(home, /<dd>November 2026<\/dd>/);
  assert.match(home, /Example screen · invented data/i);
  for (const f of realPages) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /\[(DATE|MONTH)\]/, path.relative(OUT, f));
});

test("sitemap lists every real page and robots points to it", () => {
  const sm = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
  for (const u of ["/", "/team/", "/ventures/", "/blog/", "/ventures/agentiqly-ai/", "/ventures/snfiq/"]) assert.ok(sm.includes(`<loc>https://www.agentiqly.io${u}</loc>`), u);
  assert.doesNotMatch(sm, /404/);
  assert.match(fs.readFileSync(path.join(OUT, "robots.txt"), "utf8"), /Sitemap: https:\/\/www\.agentiqly\.io\/sitemap\.xml/);
});

test("email signature images still served at the root", () => {
  for (const f of ["agentiqly-logo.jpg", "agentiqly-logo-new.jpg", "favicon.svg", "og.png"]) assert.ok(fs.existsSync(path.join(OUT, f)), f);
});

test("blog shows the empty state with no posts and lists posts when added", () => {
  const blog = fs.readFileSync(path.join(OUT, "blog/index.html"), "utf8");
  const hasPosts = fs.readdirSync(path.join(ROOT, "content/blog")).some((n) => n.endsWith(".md") && n.toLowerCase() !== "readme.md");
  if (!hasPosts) assert.match(blog, /First posts coming soon/);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aqsite-src-"));
  fs.cpSync(ROOT, tmp, { recursive: true, filter: (s) => !s.includes(`${path.sep}dist`) && !s.includes(`${path.sep}.git`) });
  fs.writeFileSync(path.join(tmp, "content/blog/test-post.md"),
    '---\ntitle: "What a test post proves"\ndescription: "A post written in the content engine format, used only by the test."\nslug: "test-post"\ndate: "2026-11-02"\nsources: [{"url":"https://example.com/a","title":"Example source"}]\nfaq: [{"q":"Does it render?","a":"Yes."}]\n---\n## Why\n\nBecause **it** has [a link](https://example.com).\n');
  const out2 = path.join(tmp, "out");
  execFileSync(process.execPath, ["build.mjs"], { cwd: tmp, env: { ...process.env, OUT_DIR: out2 } });
  const post = fs.readFileSync(path.join(out2, "blog/test-post/index.html"), "utf8");
  assert.match(post, /What a test post proves/);
  assert.match(post, /"@type":"BlogPosting"/);
  assert.match(post, /"@type":"FAQPage"/);
  assert.match(post, /Example source/);
  assert.match(fs.readFileSync(path.join(out2, "blog/rss.xml"), "utf8"), /test-post/);
  assert.doesNotMatch(fs.readFileSync(path.join(out2, "blog/index.html"), "utf8"), /First posts coming soon/);
});

test("preview build is noindex", () => {
  const out3 = fs.mkdtempSync(path.join(os.tmpdir(), "aqsite-prev-"));
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, env: { ...process.env, OUT_DIR: out3, PREVIEW: "1" } });
  assert.match(fs.readFileSync(path.join(out3, "index.html"), "utf8"), /noindex,nofollow/);
  assert.match(fs.readFileSync(path.join(out3, "robots.txt"), "utf8"), /Disallow: \//);
  assert.equal(fs.existsSync(path.join(out3, "team.html")), false);
  assert.match(fs.readFileSync(path.join(out3, "_redirects"), "utf8"), /^\/team\.html \/team\/ 301$/m);
});

test("markdown renderer escapes html and blocks script links", () => {
  assert.equal(inline("<b>x</b>"), "&lt;b&gt;x&lt;/b&gt;");
  assert.match(inline("[x](javascript:alert(1))"), /href="#"/);
  assert.match(markdown("## A b\n\n- one\n- two"), /<h2 id="a-b">A b<\/h2>\n<ul><li>one<\/li><li>two<\/li><\/ul>/);
  const { meta, body } = parsePost('---\ntitle: "T"\nfaq: [{"q":"a","a":"b"}]\n---\nhi');
  assert.equal(meta.title, "T");
  assert.equal(meta.faq[0].q, "a");
  assert.equal(body, "hi");
});

test("new ventures: Shaket stays discreet, Cadenza stays general wellness, order kept", () => {
  const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
  const order = ["agentiqly-ai", "content-engine", "lifeiq", "clearopsiq", "adjusterospro", "snfiq", "cadenza", "scourqly", "shaket"]
    .map((s) => home.indexOf(`href="/ventures/${s}/"`));
  assert.ok(order.every((i, n) => i > -1 && (n === 0 || i > order[n - 1])), `venture order ${order}`);
  const shaket = fs.readFileSync(path.join(OUT, "ventures/shaket/index.html"), "utf8");
  assert.doesNotMatch(shaket, /class="vsec"/);
  assert.match(shaket, /Details are shared with investors only\./);
  assert.match(shaket, /href="https:\/\/shaket\.io"/);
  for (const w of [/market brief/i, /trade/i, /returns?\b/i, /strategy/i, /\$\d/]) assert.doesNotMatch(shaket.replace(/<head>[\s\S]*?<\/head>/, ""), w);
  const cadenza = fs.readFileSync(path.join(OUT, "ventures/cadenza/index.html"), "utf8");
  for (const w of [/\btreat/i, /symptom/i, /therapy/i, /\bcure/i, /diagnos/i, /clinical/i, /improves?\b/i]) assert.doesNotMatch(cadenza, w);
});
