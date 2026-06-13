# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static attorney portfolio site for Jurica Gaćina (Croatian property law specialist). Served as plain static files; a small **Node build step** pre-renders one page per language for SEO (each language is its own crawlable URL).

## Development

Edit the **source** files (`template.html`, `translations.js`, `styles.css`, `app.js`), then regenerate the pages:

```sh
node build.js
```

Serve locally via Python HTTP server from the repo root (defined in `.vscode/tasks.json` / `.claude/launch.json`):

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` (Croatian) or `/en/`, `/it/`, `/de/`. Paths are root-absolute (`/styles.css`, `/app.js`, …), so the site must be served over HTTP from the root — not opened via `file://`.

## File Layout

| File | Purpose |
|---|---|
| `template.html` | **Source** template (structure only). Holds `{{TOKENS}}` and `data-i18n` markers that `build.js` fills in. **Edit this, not the generated HTML.** |
| `translations.js` | **Source** of all content: `window.__translations` with 4 languages (hr, en, it, de). Each language has a `seo` block (`title`, `description`) plus the `data-i18n` strings. |
| `build.js` | Generator. Renders `index.html` (hr) + `en/`, `it/`, `de/` `index.html`, and regenerates `sitemap.xml`. Dependency-free Node. |
| `index.html`, `en/index.html`, `it/index.html`, `de/index.html` | **Generated — do not edit.** One fully-translated page per language. |
| `sitemap.xml` | **Generated** by `build.js` (all 4 URLs with hreflang alternates). |
| `app.js` | Runtime logic (theme, font, hero blur, presentation mode, mobile nav, language-switcher navigation, contact form). No runtime translation. |
| `styles.css` | All styles — CSS custom properties, 7 theme variants, responsive breakpoints, self-hosted Playfair `@font-face`. |
| `robots.txt` | Allows all crawlers; points to `sitemap.xml`. |
| `fonts/` | Self-hosted Playfair Display 700 (latin + latin-ext), preloaded for the lawyer-name font. |

## Architecture

**i18n (build-time):** `template.html` carries `data-i18n="dot.notation.key"` markers; `build.js` replaces each element's text with the translation for the target language and writes a separate page per language. The pages cross-link via `hreflang` tags (hr/en/it/de + `x-default`), each with its own `<html lang>`, `<title>`, description, canonical, and Open Graph locale. There is **no client-side translation** — switching language is navigation between URLs.

**Language switcher:** Desktop renders `<a>` links to `/`, `/en/`, `/it/`, `/de/`; mobile renders a `<select>` whose option values are those URLs and navigates on change (`app.js`). `build.js` marks the active language per page.

**FOUC prevention:** An inline `<head>` script applies the saved theme/font/presentation/blur (from `localStorage`) before first paint. Playfair Display is self-hosted and preloaded so the name never flashes a fallback serif.

**Theming:** 7 variants (default, marble, burgundy, forest, library, midnight, batman) driven by CSS custom properties. Applying a theme sets `data-theme` on `<html>`. Theme, font, hero blur (`--hero-blur`), and presentation mode persist to `localStorage` (shared across all language pages).

**Contact form:** Submitted via [Web3Forms](https://web3forms.com) (no backend). API key is hardcoded in `app.js`. Success/error feedback is shown inline in the page's language (derived from `<html lang>`).

## Key Conventions

- **Never edit the generated HTML** (`index.html`, `en|it|de/index.html`) or `sitemap.xml` directly — edit `template.html` / `translations.js`, then run `node build.js`.
- Add new translated strings to all 4 language objects in `translations.js`, reference them with `data-i18n` in `template.html`, then rebuild.
- New themes: add a `[data-theme="name"]` block in `styles.css` overriding the CSS variables defined in `:root`.
- In-page navigation uses smooth scrolling + `href="#section-id"` links; cross-language navigation uses real URLs. No JS router.
