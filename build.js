#!/usr/bin/env node
/*
 * Static multilingual site generator.
 *
 * Reads template.html (structure) + translations.js (content) and writes one
 * pre-rendered, fully translated page per language:
 *     /index.html        (hr, default + x-default)
 *     /en/index.html
 *     /it/index.html
 *     /de/index.html
 * It also regenerates sitemap.xml with hreflang alternates.
 *
 * Usage:  node build.js
 *
 * Why: each language gets its own crawlable URL with the translated text baked
 * into the HTML (Google does not index content injected later by JS), plus
 * per-page <title>/description/canonical/og + hreflang annotations.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const SITE = 'https://odvjetnik-gacina.hr';

const LANGS = ['hr', 'en', 'it', 'de'];
const LOCALES = { hr: 'hr_HR', en: 'en_US', it: 'it_IT', de: 'de_DE' };
const PATHS = { hr: '/', en: '/en/', it: '/it/', de: '/de/' };

// --- load translations (translations.js assigns window.__translations) ---
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'translations.js'), 'utf8'), sandbox);
const T = sandbox.window.__translations;
if (!T) throw new Error('translations.js did not define window.__translations');

const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');

// --- helpers ---
const getNested = (obj, keyPath) =>
    keyPath.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const escHtml = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escJson = (s) => JSON.stringify(String(s)).slice(1, -1);

let missing = 0;

function render(lang) {
    const t = T[lang];
    if (!t) throw new Error('No translations for language: ' + lang);
    let html = template;

    // 1) Fill every data-i18n element with the translated text.
    html = html.replace(
        /<(\w+)([^>]*\sdata-i18n="([\w.]+)"[^>]*)>([\s\S]*?)<\/\1>/g,
        (match, tag, attrs, key) => {
            const val = getNested(t, key);
            if (val == null) {
                console.warn(`  ! missing translation [${lang}] ${key}`);
                missing++;
                return match;
            }
            return `<${tag}${attrs}>${escHtml(val)}</${tag}>`;
        }
    );

    // 2) Per-page SEO tokens.
    const title = getNested(t, 'seo.title');
    const desc = getNested(t, 'seo.description');
    const keywords = getNested(t, 'seo.keywords') || '';
    const url = SITE + PATHS[lang];
    const ogAlt = LANGS.filter((l) => l !== lang)
        .map((l) => `    <meta property="og:locale:alternate" content="${LOCALES[l]}">`)
        .join('\n');

    html = html
        .split('{{LANG}}').join(lang)
        .split('{{TITLE}}').join(escAttr(title))
        .split('{{DESC}}').join(escAttr(desc))
        .split('{{DESC_JSON}}').join(escJson(desc))
        .split('{{URL}}').join(url)
        .split('{{KEYWORDS}}').join(escAttr(keywords))
        .split('{{OG_LOCALE}}').join(LOCALES[lang])
        .replace('{{OG_ALT}}', ogAlt);

    // 3) Mark the active language in the switcher (button) and dropdown (option).
    html = html.replace(
        `<a class="lang-btn" data-lang="${lang}" `,
        `<a class="lang-btn active" data-lang="${lang}" `
    );
    html = html.replace(
        `data-lang="${lang}">`,
        `data-lang="${lang}" selected>`
    );

    // 4) Strip the now-inert data-i18n attributes from the generated output.
    html = html.replace(/\s+data-i18n="[\w.]+"/g, '');

    // 5) Replace the template's source note with a "generated file" banner.
    html = html.replace(
        /^<!DOCTYPE html>\n<!--[\s\S]*?-->\n/,
        '<!DOCTYPE html>\n<!-- GENERATED FILE — do not edit. Source: template.html + translations.js. Rebuild: node build.js -->\n'
    );

    return html;
}

// --- write pages ---
for (const lang of LANGS) {
    const html = render(lang);
    const outDir = lang === 'hr' ? ROOT : path.join(ROOT, lang);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    console.log('  wrote', path.relative(ROOT, path.join(outDir, 'index.html')) || 'index.html');
}

// --- regenerate sitemap.xml with hreflang alternates ---
const today = new Date().toISOString().slice(0, 10);
const alternates = LANGS.map(
    (l) => `      <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${PATHS[l]}"/>`
).join('\n') + `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;

const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    LANGS.map(
        (lang) =>
            `  <url>\n` +
            `    <loc>${SITE}${PATHS[lang]}</loc>\n` +
            `${alternates}\n` +
            `    <lastmod>${today}</lastmod>\n` +
            `    <changefreq>monthly</changefreq>\n` +
            `    <priority>${lang === 'hr' ? '1.0' : '0.8'}</priority>\n` +
            `  </url>`
    ).join('\n') +
    `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
console.log('  wrote sitemap.xml');

console.log(missing ? `Done with ${missing} missing translation(s).` : 'Done.');
