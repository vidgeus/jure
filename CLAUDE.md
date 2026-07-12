# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static attorney portfolio site for Jurica Gaćina (Croatian property law specialist, Poreč). A small **dependency-free Node build step** pre-renders one page per language for SEO (each language is its own crawlable URL). **GitHub Pages publishes the `docs/` folder** — only the files in `docs/` are exposed to the web; everything in the repo root is source and stays private.

## Development

Edit the source, rebuild, serve `docs/`:

```sh
node build.js                          # regenerates docs/*.html + docs/sitemap.xml
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000` (Croatian) or `/en/`, `/it/`, `/de/`. Paths are root-absolute (`/styles.css`, `/app.js`, …) and `docs/` is the web root, so the site must be served over HTTP from `docs/` — not opened via `file://`. The `.vscode/tasks.json` / `.claude/launch.json` dev servers already serve `docs/`.

**Deploy:** GitHub Pages must be set to **Deploy from a branch → `main` → `/docs`**. Commit the regenerated `docs/` and push.

## File Layout

**Root — source only (never served to the web):**

| File | Purpose |
|---|---|
| `template.html` | **Source** template (structure only). Holds `{{TOKENS}}` and `data-i18n` markers that `build.js` fills in. `<html>` hardcodes `data-theme="midnight" data-presentation="true"`. |
| `translations.js` | **Source** of all content: `window.__translations` with 4 languages (hr, en, it, de). Each language has an `seo` block (`title`, `description`, `keywords`) plus the `data-i18n` strings. |
| `build.js` | Generator. Reads `template.html` + `translations.js`; writes `docs/index.html` (hr) + `docs/{en,it,de}/index.html` and `docs/sitemap.xml`. |

**`docs/` — published by GitHub Pages:**

| File | Purpose |
|---|---|
| `index.html`, `en/index.html`, `it/index.html`, `de/index.html` | **Generated — do not edit.** One fully-translated page per language. |
| `sitemap.xml` | **Generated** (4 URLs with hreflang alternates); references `sitemap.xsl`. |
| `sitemap.xsl` | Human-friendly stylesheet for `sitemap.xml` in a browser (crawlers ignore it). Static. |
| `styles.css` | **Source & served** (no build step) — all styles; single fixed Midnight theme; self-hosted Playfair `@font-face`. |
| `app.js` | **Source & served** — runtime logic (mobile nav, language-switcher navigation + scroll-preserve, contact form, current year). No theme/font/blur code. |
| `robots.txt` | Allows all crawlers; points to `sitemap.xml`. |
| `CNAME` | Custom domain (`odvjetnik-gacina.hr`). Must live in the publishing source (`docs/`). |
| `img/`, `fonts/` | Logo/hero images; self-hosted Playfair Display 700 (latin + latin-ext), preloaded. |

## Architecture

**i18n (build-time):** `template.html` carries `data-i18n="dot.notation.key"` markers; `build.js` replaces each element's text with the translation for the target language and writes a separate page per language. Pages cross-link via `hreflang` tags (hr/en/it/de + `x-default`), each with its own `<html lang>`, `<title>`, description, canonical, and Open Graph locale. There is **no client-side translation** — switching language is navigation between URLs.

**Language switcher:** Desktop renders `<a>` links to `/`, `/en/`, `/it/`, `/de/`; mobile renders a `<select>` that navigates on change (`app.js`). `build.js` marks the active language and preserves scroll position across the switch.

**Fixed design (no runtime controls):** the site has one look, baked in — `data-theme="midnight"` on `<html>` and `--name-font` (Playfair Display) + `--hero-blur` (3px) in `:root`. There is **no theme/font/blur picker or presentation toggle** (removed). `data-presentation="true"` is a static flag that drives the three-column navbar layout.

**Contact form:** Submitted via [Web3Forms](https://web3forms.com) (no backend). API key is hardcoded in `app.js`. Success/error feedback is shown inline in the page's language (derived from `<html lang>`).

## Key Conventions

- **Never edit the generated files** in `docs/` (`index.html`, `en|it|de/index.html`, `sitemap.xml`) — edit `template.html` / `translations.js` in the root, then run `node build.js`.
- `styles.css`, `app.js`, `sitemap.xsl`, `robots.txt`, `img/`, `fonts/` are hand-maintained **inside `docs/`** (they are both source and served).
- Add new translated strings to all 4 language objects in `translations.js`, reference them with `data-i18n` in `template.html`, then rebuild.
- In-page navigation uses smooth scrolling + `href="#section-id"` links; cross-language navigation uses real URLs. No JS router.
