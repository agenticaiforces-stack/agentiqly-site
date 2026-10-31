// Small markdown renderer for posts the content engine adds (headings, paragraphs, lists, quotes, links, bold, italic, code).
export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(u) {
  const url = u.trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? url : "#";
}

export function inline(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeUrl(url.replace(/&amp;/g, "&"));
    const ext = /^https?:\/\//.test(href) && !href.startsWith("https://www.agentiqly.io") && !href.startsWith("https://agentiqly.io");
    return `<a href="${esc(href)}"${ext ? ' rel="noopener"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return s;
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function markdown(src) {
  const lines = String(src).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let para = [];
  let list = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) {
      flushPara(); flushList();
      const lvl = m[1].length;
      out.push(`<h${lvl} id="${slugify(m[2])}">${inline(m[2])}</h${lvl}>`);
      continue;
    }
    if ((m = line.match(/^#\s+(.*)$/))) { flushPara(); flushList(); out.push(`<h2 id="${slugify(m[1])}">${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); out.push(`<blockquote><p>${inline(m[1])}</p></blockquote>`); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/)) || (m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      flushPara();
      const ordered = /^\s*\d/.test(line);
      const tag = ordered ? "ol" : "ul";
      if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push(ordered ? m[2] : m[1]);
      continue;
    }
    if (list) flushList();
    para.push(line.trim());
  }
  flushPara(); flushList();
  return out.join("\n");
}

/** Front matter as written by the content engine: one `key: <JSON value>` per line between --- fences. */
export function parsePost(text) {
  const m = String(text).match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("post has no front matter");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    const raw = line.slice(i + 1).trim();
    try { meta[key] = JSON.parse(raw); } catch { meta[key] = raw.replace(/^["']|["']$/g, ""); }
  }
  return { meta, body: m[2] };
}

export function readingMinutes(body) {
  const words = String(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
