# Content format

AgentiQly HQ opens a pull request with one Markdown file per piece. Nothing is published until the pull request is merged.

- Posts: `content/blog/<slug>.md`, served at `/blog/<slug>/`
- Guides: `content/guides/<slug>.md`, served at `/guides/<slug>/`

Front matter is one `key: <JSON value>` per line:

```
---
title: "What the piece answers"
description: "One sentence for search results."
slug: "the-slug"
date: "2026-11-02"
canonical: "https://www.agentiqly.io/blog/the-slug"
topic: "topic-slug"
sources: [{"url":"https://example.com","title":"Source title"}]
faq: [{"q":"Question?","a":"Answer."}]
---
Markdown body (## headings, lists, links, **bold**, *italic*, > quotes).
```

`draft: true` keeps a file out of the build. Posts with sources list them under the article; FAQ entries are shown on the page and marked up for search.
