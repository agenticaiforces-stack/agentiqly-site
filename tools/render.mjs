import { chromium } from 'playwright-core';
import fs from 'fs';
// usage: node render.mjs <html-file> <out.png> <w> <h>
const [,, html, out, w, h] = process.argv;
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: false, args: ['--no-sandbox', '--headless=new'] });
const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })).newPage();
await p.setContent(fs.readFileSync(html, 'utf8'), { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: out, omitBackground: false });
await b.close();
