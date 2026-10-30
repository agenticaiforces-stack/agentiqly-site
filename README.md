# agentiqly.io

The AgentiQly.io corporate site: a static site built by `build.py` (Python 3, no dependencies) into `public/`.

- `python3 build.py` builds every page, the blog, `blog/feed.xml`, `sitemap.xml` and `robots.txt`.
- `static/` is copied as is (fonts, logo, icons, the email signature).
- Blog posts are Markdown files in `content/blog/`, written by the content engine through pull requests. Front matter values are JSON: `title`, `description`, `slug`, `canonical`, `sources` (list of `{url, title}`), and optional `date` (YYYY-MM-DD; otherwise the date the file was added).
- `python3 tools/logo.py` redraws the logo and favicon SVGs (needs `fonttools` and `brotli`).

Hosting: build command `python3 build.py`, publish directory `public`.
