# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for **Jordan Cole — Metabolic Health Coach**. No build system, no dependencies, no package manager — just three files served directly in a browser.

## Running the Site

Open `index.html` directly in a browser, or use any static file server:

```
npx serve .
# or
python -m http.server 8080
```

## Architecture

Three files do everything:

- **`index.html`** — All markup. Ten sections in order: Nav, Hero, Problem, Philosophy Pillars, Offer, About, Insights, Testimonials, FAQ, Final CTA, Footer.
- **`style.css`** — Design tokens at the top in `:root` (colors, radii, shadows, fonts, spacing). Sections are delimited by large block comments. Two responsive breakpoints: `900px` (tablet) and `600px` (mobile).
- **`script.js`** — Four independent behaviors: nav scroll state, `.fade-up` IntersectionObserver animations, pillars carousel (autoplay + touch + dots), and FAQ accordion.

## Design System

All visual values are CSS custom properties defined in `:root`:
- Colors: `--bg-primary` (#FBF9F6), `--bg-accent` (#E8ECE7), `--text-heading` (#1E2D24), `--accent-green` (#3D6B4A)
- Fonts: `--font-serif` (Playfair Display), `--font-sans` (DM Sans), Sacramento (used only for `.about__name`)
- Layout: `--nav-h: 72px`, `--section-pad: 120px` (shrinks at breakpoints)

## Key External Links

- Discovery call booking: `https://example-coaching.com/book`
- WhatsApp: `https://wa.me/15550100100`
- Instagram: `https://instagram.com/example`
- Contact email: `hello@example-coaching.com`

These appear in the nav, hero, final CTA, and footer — update all instances when changing.

## Static Assets

`logo.png`, `hero-photo.jpg`, `about-photo.jpg` — referenced directly by filename in `index.html`. Replace files in place to swap images without changing markup.
