# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static attorney portfolio site for Jurica Gaćina (Croatian property law specialist). Zero build tools — pure HTML/CSS/JS served as static files.

## Development

Run locally via Python HTTP server (defined in `.vscode/tasks.json`):

```sh
python3 -m http.server 8000
```

Open at `http://localhost:8000`. No build step, no install step.

## File Layout

| File | Purpose |
|---|---|
| `index.html` | Single HTML page with 7 sections: nav, hero, about, practice areas, location, contact, footer |
| `app.js` | All application logic (theme, i18n, form, mobile nav, localStorage) |
| `styles.css` | All styles — CSS custom properties, 7 theme variants, responsive breakpoints |
| `translations.js` | Translation strings loaded as `window.__translations`; 4 languages (hr, en, it, de) |

## Architecture

**i18n:** HTML elements carry `data-i18n="dot.notation.key"` attributes. `setLanguage(lang)` in `app.js` resolves keys via `getNestedTranslation()` and updates `textContent`. Selected language persists in `localStorage`.

**Theming:** 7 variants (default, marble, burgundy, forest, library, midnight, batman) driven by CSS custom properties. Applying a theme sets `data-theme` on `<html>`. Font, hero blur (CSS `--hero-blur` variable), and presentation mode also persist to `localStorage`.

**Contact form:** Submitted via [Web3Forms](https://web3forms.com) (no backend). API key is hardcoded in `app.js`. Success/error feedback is shown inline in all 4 languages.

**Mobile nav:** Hamburger toggle; language switcher renders as buttons on desktop and a `<select>` dropdown on mobile (synced via JS).

## Key Conventions

- Add new translated strings to all 4 language objects in `translations.js`, then reference them with `data-i18n` in HTML.
- New themes: add a `[data-theme="name"]` block in `styles.css` overriding the CSS variables defined in `:root`.
- Smooth scrolling and section anchoring use native `scroll-behavior: smooth` + `href="#section-id"` links; no JS router.
