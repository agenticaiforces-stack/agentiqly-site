#!/usr/bin/env python3
"""Builds the agentiqly.io site into public/. No dependencies beyond Python 3.

Blog posts are Markdown files in content/blog/ with a front matter block whose
values are JSON (the format the content engine writes)."""
import datetime as dt
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

from tools.logo import A_PATHS, A_VIEW, Q_PATHS, Q_VIEW, strokes

ROOT = Path(__file__).parent
OUT = ROOT / "public"
SITE = "https://agentiqly.io"
CONTACT = "mailto:moshe@agentiqly.io"
KICKER = "Israeli–US AI agentic startup incubator"
TITLE = "AgentiQly.io · Israeli–US AI agentic startup incubator"
DESC = ("AgentiQly.io builds AI agent products, runs them on businesses we own, and publishes what happened. "
        "Every venture is built to scale and, in time, to exit.")

e = html.escape


def ph(text):
    return f'<span class="ph">[{e(text)}]</span>'


VENTURES = [
    dict(slug="agentiqly-ai", name="AgentiQly.ai", status="In beta", tone="good", url="https://agentiqly.ai",
         line="An AI sales agent for online stores that answers buyers, tracks orders and reports the sales it actually closed.",
         note="In beta with our first client.",
         customer="Online stores that sell through their own website and answer the same buyer questions every day.",
         problem="Buyers ask about stock, sizes, shipping and orders at all hours. Unanswered questions turn into abandoned carts and support email.",
         others="General website chat widgets, help-desk tools with bots, and store-platform apps.",
         differs="It reports the sales it closed and the questions it could not answer, so the owner sees what the agent is worth and what to fix.",
         potential="Plan: prove the agent on our first client's store, then offer it to more stores on a monthly plan with a clear report of sales it influenced."),
    dict(slug="content-engine", name="Content engine", status="On our sites", tone="good", url="/blog/",
         line="Turns real customer questions into sourced articles and FAQs, checked five ways before anything is published.",
         note="",
         customer="Businesses that need a steady flow of useful articles but can't trust generic AI writing with their name.",
         problem="Most AI writing reads like AI, repeats itself and states facts nobody checked. Search engines and readers both notice.",
         others="AI writing tools, SEO content agencies and freelance writers.",
         differs="Every fact comes from a page it read, every piece passes five checks before a person sees it, and nothing posts without the owner's yes unless the owner allows it.",
         potential="Plan: run it on our own sites first and publish the results, then open it to subscribers with one account per business."),
    dict(slug="lifeiq", name="LifeIQ", status="Pre-launch", tone="warn", url="https://lifeiq.dev",
         line="A personal AI companion that keeps track of renewals, dates and the paperwork of daily life.",
         note="",
         customer="Busy people and households who keep missing renewals, deadlines and paperwork.",
         problem="Important dates live in inboxes, drawers and memory. Missing one costs money and time.",
         others="Calendar apps, to-do apps and document-storage apps.",
         differs="It reads the paperwork and keeps track of what is due, instead of waiting for you to type every date in.",
         potential="Plan: launch to a first group of users, learn which reminders they act on, then grow on a subscription."),
    dict(slug="clearopsiq", name="ClearOpsIQ", status="In build", tone="warn", url="https://clearopsiq.com",
         line="Operations intelligence for Amazon and ecommerce sellers: what changed, what it cost, and what to check next.",
         note="",
         customer="Amazon and ecommerce sellers who run on thin margins and many moving parts.",
         problem="Fees, stock, listings and ads change every day, and the cost of a change often shows up weeks later.",
         others="Seller analytics dashboards, spreadsheets and outside account managers.",
         differs="It explains what changed and what it cost in plain words, then says what to check next.",
         potential="Plan: build with a first group of sellers, then sell on a monthly plan sized to the seller."),
    dict(slug="adjusterospro", name="AdjusterOS Pro", status="In build", tone="warn", url="https://adjusterospro.com",
         line="A working system for insurance adjusters: claims intake, documents and deadlines in one place.",
         note="",
         customer="Independent and staff insurance adjusters handling many claims at once.",
         problem="Claims arrive from many places, documents pile up and deadlines are easy to miss.",
         others="Large claims-management suites built for carriers, and general file and spreadsheet tools.",
         differs="It is built around one adjuster's working day: intake, the documents for each claim and the next deadline, on a phone first.",
         potential="Plan: prove it with working adjusters, then offer it per seat to adjusters and small firms."),
    dict(slug="snfiq", name="SNF IQ", status="On hold", tone="muted", url="https://snfiq.io",
         line="Acquisition research for skilled nursing facilities, scoring which owners are likely to sell.",
         note="",
         customer="Buyers and advisers looking for skilled nursing facilities to acquire.",
         problem="Finding facilities whose owners may sell takes months of manual research across public records.",
         others="Industry data subscriptions, brokers and manual research.",
         differs="It pulls the public signals together and scores each facility, so research starts with a short list.",
         potential="On hold. The plan is written down for when it restarts."),
]

TEAM = {
    "Israel": ["Moshe Shimon", "Dan Kreisel", "Eliyahu Pereira", None],
    "United States": ["Ron Kreisel", "Ben Itzkowitz", None],
}

LOGO_A = (f'<svg class="draw" viewBox="{A_VIEW}" width="38" height="38" aria-hidden="true" style="margin-bottom:-3px">'
          f'<g fill="none" stroke="#6cc3cb" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">{strokes(A_PATHS)}</g></svg>')
LOGO_Q = (f'<svg class="draw" viewBox="{Q_VIEW}" width="36" height="36" aria-hidden="true" style="margin:0 -2px -5px 1px">'
          f'<g fill="none" stroke="#6cc3cb" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">{strokes(Q_PATHS)}</g></svg>')
NAV = [("/ventures/", "Ventures"), ("/#proof", "Track record"), ("/#how", "How we build"), ("/team/", "Team"), ("/blog/", "Blog")]


def page(path, title, desc, body, current="", og_type="website", extra_head=""):
    canon = SITE + path
    cur = ' aria-current="page"'
    links = "".join(f'<a href="{h}"{cur if h == current else ""}>{t}</a>' for h, t in NAV)
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="AgentiQly.io">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0d141f">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="AgentiQly.io blog" href="/blog/feed.xml">
<link rel="preload" href="/assets/fonts/schibsted-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
{extra_head}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="bar">
<nav aria-label="Main">
<a class="logo" href="/" aria-label="AgentiQly.io">{LOGO_A}<span aria-hidden="true">genti</span>{LOGO_Q}<span aria-hidden="true">ly<span class="io">.io</span></span></a>
<a class="cta" href="{CONTACT}">Talk to Moshe</a>
<div class="links">{links}</div>
</nav>
</header>
<main id="main">
{body}
</main>
<footer>
<div class="wrap">
<p><b>AgentiQly.io</b> · {KICKER}</p>
<p>© 2026 AgentiQly.io · <a href="{CONTACT}">moshe@agentiqly.io</a> · <a href="/blog/feed.xml">RSS</a></p>
</div>
</footer>
</body>
</html>
"""
    target = OUT / path.lstrip("/") / "index.html" if path.endswith("/") else OUT / path.lstrip("/")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(doc)
    return path


def words(text, start=0.08, step=0.08, script=None):
    out, t = [], start
    for w in text.split(" "):
        if w == "§":
            out.append(f'<span class="w script" style="animation-delay:{t + .08:.2f}s">show you</span>')
            t += 0.16
            continue
        out.append(f'<span class="w" style="animation-delay:{t:.2f}s">{e(w)}</span>')
        t += step
    return " ".join(out)


def venture_rows(link=True):
    rows = []
    for v in VENTURES:
        note = f' <span class="muted" style="font-size:15px">{e(v["note"])}</span>' if v["note"] else ""
        host = v["url"].replace("https://", "") if v["url"].startswith("http") else ""
        hostline = f' <span class="muted" style="font-size:15px">{e(host)}</span>' if host else ""
        rows.append(
            f'<li><a class="name" href="/ventures/{v["slug"]}/">{e(v["name"])}</a>'
            f'<span class="mono s-{v["tone"]}">{e(v["status"].upper())}</span>'
            f'<span>{e(v["line"])}{note}{hostline}</span></li>')
    return "\n".join(rows)


def team_list(short=False):
    BIO = '<span class="muted" style="display:block">' + ph("Role and bio coming") + "</span>"
    out = []
    for region, people in TEAM.items():
        items = []
        for p in people:
            if p:
                initials = "".join(x[0] for x in p.split())
                items.append(f'<li><span class="mono-mark" aria-hidden="true">{initials}</span><span><b>{e(p)}</b>'
                             f'{"" if short else BIO}</span></li>')
            else:
                items.append('<li><span class="mono-mark anon" aria-hidden="true">·</span><span><b>Team member</b>'
                             '<span class="muted" style="display:block">Name withheld, by choice</span></span></li>')
        out.append(f'<h3 style="margin-top:32px">{region} team</h3><ul class="people">{"".join(items)}</ul>')
    return "".join(out)


def home():
    body = f"""
<section class="hero" aria-labelledby="hero-title">
<div>
<p class="label">{e(KICKER)}</p>
<h1 id="hero-title">{words("We build AI products,")}<br>{words("run them on our own businesses,", .40)}<br>{words("and § what happened.", .88)}</h1>
<p class="lede">Every venture is built to scale and, in time, to exit. Each one earns its place on a business we own before we offer it to yours.</p>
<div class="actions"><a class="btn" href="/ventures/">See the ventures →</a><a class="textlink" href="#proof">How we prove results</a></div>
<p class="small">Nothing goes live without a person's yes.</p>
</div>
<figure class="screen fade" style="animation-delay:1.3s">
<figcaption><span>CONTENT ENGINE · THIS MORNING</span><span>EXAMPLE SCREEN · INVENTED DATA</span></figcaption>
<div class="row"><div class="top"><b>How to fix check alignment in five minutes</b><span class="st wait">WAITING FOR YOU</span></div>
<p>Asked 23 times in chat this month · step-by-step guide · writer: reason-why method</p>
<div class="chks"><span class="chk" style="animation-delay:2.05s">✓ FACTS · 6 SOURCES</span><span class="chk" style="animation-delay:2.30s">✓ HUMAN RHYTHM</span><span class="chk" style="animation-delay:2.55s">✓ NO AI TELLS</span><span class="chk" style="animation-delay:2.80s">✓ FRESH EYES</span><span class="chk" style="animation-delay:3.05s">✓ SEARCH &amp; AI</span></div>
<div class="fake" aria-hidden="true"><span>Approve</span><span>Ask for a change</span></div></div>
<div class="row"><div class="top"><b>Is a voucher check right for payroll?</b><span class="st live">WENT LIVE 6:02 AM</span></div><p>FAQ answer · 3 sentences · indexed</p></div>
<div class="row"><div class="top"><b>The history of business checks</b><span class="st held">HELD</span></div><p>Needs original sources before writing</p></div>
</figure>
</section>

<section class="wrap" style="padding-bottom:64px" aria-labelledby="steps-title">
<p class="label" id="steps-title">How every product works</p>
<ol class="steps">
<li class="settle"><span class="mono" style="color:var(--accent)">01</span><b>Listens</b><p>Real questions from your customers.</p></li>
<li class="settle"><span class="mono" style="color:var(--accent)">02</span><b>Researches</b><p>Every fact from a page it read.</p></li>
<li class="settle"><span class="mono" style="color:var(--accent)">03</span><b>Drafts</b><p>In the method of a named writer.</p></li>
<li class="settle"><span class="mono" style="color:var(--accent)">04</span><b>Checks</b><p>Five ways before you see it.</p></li>
<li class="settle"><span class="mono" style="color:var(--accent)">05</span><b>Waits for your yes</b><p>Or posts on its own, if you allow it.</p></li>
<li class="settle"><span class="mono" style="color:var(--accent)">06</span><b>Learns</b><p>What you reject stops coming back.</p></li>
</ol>
</section>

<section class="sec" aria-labelledby="note-title">
<div class="wrap narrow settle">
<p class="label">From the founder</p>
<h2 id="note-title" style="margin-bottom:20px">Why there are no testimonials on this page</h2>
<p>You have seen a hundred AI agencies with glowing logos and five-star quotes from people you can't find. I didn't want to build another one.</p>
<p>So here is how AgentiQly.io works. We build a product. We run it on a business we own, with real customers and real money on the line. We write down what happened, including what didn't work. Only then do we offer it to anyone else.</p>
<p>Our first track record is being built in the open, on six of our own sites, and we will publish it month by month.</p>
<p style="margin-top:24px;font-weight:600">Moshe <span class="muted" style="font-weight:400">· Founder, AgentiQly.io</span></p>
</div>
</section>

<section id="ventures" class="sec" aria-labelledby="ventures-title">
<div class="wrap settle">
<p class="label">Ventures · Studio log as of {ph("date")} · updated by hand</p>
<h2 id="ventures-title" style="max-width:760px">Each product solves one problem for one kind of business.</h2>
<p class="muted" style="margin:12px 0 0">Some are live, some are in build. Each one says which.</p>
<ul class="vlist">
{venture_rows()}
</ul>
<p style="margin-top:20px"><a class="textlink" href="/ventures/">Every venture, with its market brief →</a></p>
</div>
</section>

<section id="proof" class="sec sunk" aria-labelledby="proof-title">
<div class="wrap settle">
<p class="label">Track record</p>
<h2 id="proof-title" style="max-width:760px">Six of our own sites. A saved "before". Results published every month.</h2>
<ol class="olist">
<li><span class="n" aria-hidden="true">01</span><div><p><b>Day 0: save the "before".</b> Google numbers, dated screenshots of the pages on desktop and phone, and speed reports, saved before any change is made. What AI assistants say about each site is added once that measurement starts.</p><p class="mono muted" style="margin-top:4px">PROGRAM START: {ph("date")}</p></div></li>
<li><span class="n" aria-hidden="true">02</span><div><p><b>Every week: record what changed.</b> The same numbers, measured the same way, logged automatically. Anything we cannot read shows as unavailable, never as zero.</p></div></li>
<li><span class="n" aria-hidden="true">03</span><div><p><b>Every month: publish it.</b> A short report with the raw numbers attached, good months and bad.</p><p class="mono muted" style="margin-top:4px">FIRST REPORT: {ph("month")}</p></div></li>
</ol>
</div>
</section>

<section id="how" class="sec" aria-labelledby="how-title">
<div class="wrap split settle">
<div><p class="label">How we build</p><h2 id="how-title">One written rulebook covers every product we make.</h2></div>
<dl class="dl wide">
<div><dt>No number we can't show you.</dt><dd>Every figure on our screens says where it came from. If data is missing, the screen says "Unavailable", never zero.</dd></div>
<div><dt>You approve what matters.</dt><dd>Spending money, publishing in your name, or changing live data waits for a person to say yes.</dd></div>
<div><dt>Your data stays in your account.</dt><dd>Each business is kept separate from every other, and access is checked on our servers, not in your browser.</dd></div>
<div><dt>Built for the phone in your pocket.</dt><dd>Every screen is designed for a phone first, then the desk.</dd></div>
</dl>
</div>
</section>

<section id="team" class="sec" aria-labelledby="team-title">
<div class="wrap settle">
<p class="label">Team</p>
<h2 id="team-title">Two teams, one in Israel and one in the United States.</h2>
{team_list(short=True)}
<p style="margin-top:20px"><a class="textlink" href="/team/">Meet the team →</a></p>
</div>
</section>

<section id="founders" class="sec band" aria-labelledby="founders-title">
<div class="wrap split">
<div>
<p class="label" style="color:inherit;opacity:.85">For founders and operators</p>
<h2 id="founders-title">Have a problem worth a company? Build it with us.</h2>
<p style="margin:16px 0 0">AgentiQly.io is a joint Israeli–US incubator for AI agent startups. We take on a small number of ventures at a time and build each one to scale and, in time, to exit. You bring the problem and the business that has it. We bring the build, the running of it, and the record of what happened.</p>
</div>
<div class="box">
<p class="mono" style="margin:0 0 12px">A FIRST CONVERSATION COVERS</p>
<ul>
<li>30 minutes with Moshe, not a sales team</li>
<li>Your problem, and whether software is the right fix</li>
<li>What a first version would do, and what it would cost</li>
<li>A straight yes or no on whether we're the right fit</li>
</ul>
<a class="btn" href="{CONTACT}">Book a conversation</a>
<p style="margin:12px 0 0;font-size:14px;line-height:20px">Or write to moshe@agentiqly.io</p>
</div>
</div>
</section>
"""
    org = json.dumps({"@context": "https://schema.org", "@type": "Organization", "name": "AgentiQly.io", "url": SITE,
                      "logo": SITE + "/assets/logo-light.svg", "email": "moshe@agentiqly.io"})
    return page("/", TITLE, DESC, body, extra_head=f'<script type="application/ld+json">{org}</script>\n')


def team():
    body = f"""
<section class="wrap phead">
<p class="label">Team</p>
<h1>The people behind AgentiQly.io</h1>
<p class="lede">Two teams, one in Israel and one in the United States. Roles, bios and photos appear here as each person approves their own.</p>
</section>
<section class="sec" style="padding-top:24px"><div class="wrap">{team_list()}</div></section>
"""
    return page("/team/", "Team · AgentiQly.io", "The Israel and US teams behind AgentiQly.io, an Israeli–US AI agentic startup incubator.", body, current="/team/")


def ventures_index():
    body = f"""
<section class="wrap phead">
<p class="label">Ventures · Studio log as of {ph("date")}</p>
<h1>Each product solves one problem for one kind of business.</h1>
<p class="lede">Every venture runs on a business we own before we offer it to anyone else. Each page says plainly where it stands.</p>
</section>
<section class="wrap" style="padding-bottom:64px"><ul class="vlist">{venture_rows()}</ul></section>
<section class="sec sunk" aria-labelledby="pipeline-title"><div class="wrap">
<p class="label">Pipeline</p>
<h2 id="pipeline-title">What we may build next</h2>
<div class="empty" style="margin-top:24px"><p style="margin:0">The pipeline list is being prepared. Domains appear here once they're confirmed.</p></div>
</div></section>
"""
    return page("/ventures/", "Ventures · AgentiQly.io", "AgentiQly.io's ventures, each with its honest status, market brief and plan.", body, current="/ventures/")


def venture(v):
    site = (f'<a class="btn" href="{v["url"]}">Visit {e(v["url"].replace("https://", ""))} →</a>' if v["url"].startswith("http")
            else f'<a class="btn" href="{v["url"]}">Read the blog it writes →</a>')
    body = f"""
<section class="wrap phead">
<p class="label"><a href="/ventures/">Ventures</a> · <span class="s-{v["tone"]}">{e(v["status"].upper())}</span></p>
<h1>{e(v["name"])}</h1>
<p class="lede">{e(v["line"])}</p>
<div class="actions">{site}</div>
</section>
<section class="sec"><div class="wrap prose">
<h2 style="margin-top:0">Niche and market</h2>
<dl class="facts">
<dt>Customer</dt><dd>{e(v["customer"])}</dd>
<dt>Problem</dt><dd>{e(v["problem"])}</dd>
<dt>Market size</dt><dd>{ph("Figure to be added with a cited source")}</dd>
<dt>Who else serves it</dt><dd>{e(v["others"])}</dd>
<dt>How this differs</dt><dd>{e(v["differs"])}</dd>
</dl>
<h2>Potential</h2>
<p>{e(v["potential"])}</p>
<h2>Results</h2>
<p class="muted">No results published yet. Proof-program results for this venture appear here once they exist, with the raw numbers attached.</p>
</div></section>
"""
    return page(f'/ventures/{v["slug"]}/', f'{v["name"]} · AgentiQly.io ventures', v["line"], body, current="/ventures/")


# ---------- blog ----------

def front_matter(text):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            try:
                meta[k.strip()] = json.loads(v.strip())
            except json.JSONDecodeError:
                meta[k.strip()] = v.strip().strip('"')
    return meta, m.group(2)


def inline(s):
    s = e(s, quote=False)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+|/[^)\s]*)\)", lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
    return s


def markdown(md):
    out, para, lst = [], [], None

    def flush():
        nonlocal para, lst
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para = []
        if lst:
            tag, items = lst
            out.append(f"<{tag}>" + "".join(f"<li>{inline(i)}</li>" for i in items) + f"</{tag}>")
            lst = None

    for raw in md.splitlines():
        line = raw.rstrip()
        h = re.match(r"^(#{2,4})\s+(.*)", line)
        ul = re.match(r"^\s*[-*]\s+(.*)", line)
        ol = re.match(r"^\s*\d+[.)]\s+(.*)", line)
        if not line.strip():
            flush()
        elif h:
            flush()
            n = len(h.group(1))
            out.append(f"<h{n}>{inline(h.group(2))}</h{n}>")
        elif line.startswith("# "):
            flush()
        elif ul or ol:
            tag = "ul" if ul else "ol"
            if para:
                out.append(f"<p>{inline(' '.join(para))}</p>")
                para = []
            if not lst or lst[0] != tag:
                flush()
                lst = (tag, [])
            lst[1].append((ul or ol).group(1))
        else:
            if lst:
                flush()
            para.append(line.strip())
    flush()
    return "\n".join(out)


def post_date(meta, path):
    if meta.get("date"):
        return dt.date.fromisoformat(str(meta["date"])[:10])
    try:
        r = subprocess.run(["git", "log", "--diff-filter=A", "--format=%as", "--", str(path)], cwd=ROOT,
                           capture_output=True, text=True, check=True)
        if r.stdout.strip():
            return dt.date.fromisoformat(r.stdout.strip().splitlines()[-1])
    except (subprocess.SubprocessError, OSError, ValueError):
        pass
    return dt.date.today()


def load_posts():
    posts = []
    for f in sorted((ROOT / "content" / "blog").glob("*.md")):
        meta, body = front_matter(f.read_text())
        slug = meta.get("slug") or f.stem
        if not re.fullmatch(r"[a-z0-9-]+", slug):
            raise SystemExit(f"bad slug in {f.name}")
        text = re.sub(r"[#*_\[\]()>`-]", " ", body)
        posts.append(dict(slug=slug, title=meta.get("title", slug), desc=meta.get("description", ""), sources=meta.get("sources") or [],
                          date=post_date(meta, f), body=body, minutes=max(1, round(len(text.split()) / 230))))
    posts.sort(key=lambda p: (p["date"], p["slug"]), reverse=True)
    return posts


def fmt(d):
    return d.strftime("%-d %b %Y")


def blog(posts):
    if posts:
        items = "".join(
            f'<li><a href="/blog/{p["slug"]}/">{e(p["title"])}</a><p class="mono muted" style="margin:6px 0 0">'
            f'{fmt(p["date"])} · {p["minutes"]} min read</p><p style="margin:6px 0 0" class="muted">{e(p["desc"])}</p></li>'
            for p in posts)
        listing = f'<ul class="posts">{items}</ul>'
    else:
        listing = '<div class="empty"><p style="margin:0"><b>First posts coming soon.</b></p><p class="muted" style="margin:8px 0 0">Every post here is written from sources we fetched and read, checked five ways, and approved by a person before it is published.</p></div>'
    body = f"""
<section class="wrap phead">
<p class="label">Blog</p>
<h1>Notes from building AI products on our own businesses</h1>
<p class="lede">For founders, operators and investors: Israeli tech by the numbers, the Israel–US startup corridor, AI agents in real businesses, building to exit, and our monthly proof-program reports.</p>
</section>
<section class="wrap" style="padding-bottom:64px">{listing}</section>
"""
    page("/blog/", "Blog · AgentiQly.io", "Sourced articles for founders, operators and investors from AgentiQly.io, an Israeli–US AI agentic startup incubator.", body, current="/blog/")
    for p in posts:
        src = "".join(f'<li><a href="{e(s.get("url", ""))}">{e(s.get("title") or s.get("url", ""))}</a></li>' for s in p["sources"] if isinstance(s, dict))
        art = json.dumps({"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["desc"],
                          "datePublished": p["date"].isoformat(), "author": {"@type": "Organization", "name": "AgentiQly.io"},
                          "publisher": {"@type": "Organization", "name": "AgentiQly.io"}}).replace("<", "\\u003c")
        body = f"""
<article class="wrap phead">
<p class="label"><a href="/blog/">Blog</a></p>
<h1>{e(p["title"])}</h1>
<p class="mono muted" style="margin:16px 0 0">{fmt(p["date"])} · AgentiQly.io · {p["minutes"]} min read</p>
<div class="prose" style="margin-top:32px">
{markdown(p["body"])}
{f'<h2>Sources</h2><ol>{src}</ol>' if src else ''}
<p style="margin-top:40px"><a class="textlink" href="/blog/">← All posts</a></p>
</div>
</article>
"""
        page(f'/blog/{p["slug"]}/', f'{p["title"]} · AgentiQly.io', p["desc"], body, current="/blog/", og_type="article",
             extra_head=f'<script type="application/ld+json">{art}</script>\n')
    items = "".join(
        f"<item><title>{e(p['title'])}</title><link>{SITE}/blog/{p['slug']}/</link><guid>{SITE}/blog/{p['slug']}/</guid>"
        f"<pubDate>{dt.datetime.combine(p['date'], dt.time(12)).strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>"
        f"<description>{e(p['desc'])}</description></item>" for p in posts)
    (OUT / "blog" / "feed.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>AgentiQly.io blog</title>'
        f'<link>{SITE}/blog/</link><description>{e(DESC)}</description><language>en-us</language>{items}</channel></rss>\n')
    return [f'/blog/{p["slug"]}/' for p in posts]


def redirect(old, new):
    f = OUT / old.lstrip("/")
    f.write_text(f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="{SITE}{new}">'
                 f'<meta http-equiv="refresh" content="0; url={new}"><title>Moved</title><a href="{new}">This page has moved.</a>\n')


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "static", OUT)
    urls = [home(), team(), ventures_index(), *[venture(v) for v in VENTURES]]
    urls += ["/blog/", *blog(load_posts())]
    body = """<section class="wrap phead"><p class="label">404</p><h1>That page isn't here.</h1>
<p class="lede">It may have moved when the site was rebuilt.</p><div class="actions"><a class="btn" href="/">Go to the home page</a></div></section>"""
    page("/404.html", "Page not found · AgentiQly.io", "This page could not be found.", body)
    for old, new in {"/team.html": "/team/", "/about.html": "/", "/projects.html": "/ventures/", "/case-studies.html": "/#proof"}.items():
        redirect(old, new)
    today = dt.date.today().isoformat()
    (OUT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                                     + "".join(f"<url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>" for u in urls) + "</urlset>\n")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /email-signature.html\n\nSitemap: {SITE}/sitemap.xml\n")
    print(f"built {len(urls)} pages into {OUT}")


if __name__ == "__main__":
    main()
