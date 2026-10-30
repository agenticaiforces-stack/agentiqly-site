# agentiqly.io

The AgentiQly.io studio site. Plain static HTML built by one Node script, no dependencies.

```
node build.mjs            # builds dist/
PREVIEW=1 node build.mjs  # same, but every page is noindex (for preview links)
npm test                  # metadata, links, banned words, blog, preview checks
```

- Content and venture statuses: `src/site.mjs`. Placeholders such as `[DATE]` show highlighted until the owner fills them in.
- Page templates: `build.mjs` and `src/layout.mjs`. Fonts and logos are self-hosted under `assets/`.
- Blog posts and guides: `content/blog/*.md` and `content/guides/*.md`, added by pull request from AgentiQly HQ. See `content/README.md`.
- Old pages are kept, unpublished, in `legacy/`. Their old addresses forward to the new pages.
- Hosting: Render static site. Build command `node build.mjs`, publish directory `dist`.
- The logo SVGs come from `tools/make_logo.py`; `tools/render.mjs` makes the PNG icons and the share image.
