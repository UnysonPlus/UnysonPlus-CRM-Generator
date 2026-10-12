# Free CRM Website Generator

A free, browser-only tool at **https://crm.unysonplus.com/** that turns a few choices
(industry, pages, listings, lead forms, CRM pipeline, brand) into:

- **a build prompt** to paste into an AI coding agent, and
- **`site-spec.json`**, a structured description of the site (also embedded at the end of the prompt).

The agent then builds the site on WordPress with the free Unyson+ framework and its AI Dev Kit.
Real estate is the first industry preset.

Guide and roadmap: https://docs.unysonplus.com/guides/crm-generator

## How it is built

Plain HTML, CSS and JavaScript with no build step, so all page content is in the HTML that search
engines read. Nothing is sent to a server: choices are stored in the visitor's browser
(`localStorage`) and can be shared through a link that packs them into the URL hash.

| File | What it is |
|---|---|
| `index.html` | The page, metadata and structured data (WebApplication, HowTo, FAQPage) |
| `assets/app.js` | Presets, spec builder, prompt builder, copy / download / share |
| `assets/style.css` | Styles (OKLCH tokens, light and dark) |
| `CNAME`, `robots.txt`, `sitemap.xml`, `404.html` | Hosting and SEO files |
| `.github/workflows/pages.yml` | Deploys the repo root to GitHub Pages on every push to `main` |

Run it locally by opening `index.html`, or serve the folder (`npx serve .`).

## Spec format

`spec_version` is bumped when the shape of `site-spec.json` changes. Version `1.0` sections:
`business`, `pages`, `listings`, `lead_capture`, `crm`, `brand`, `seo`, `compliance`, `build`.
