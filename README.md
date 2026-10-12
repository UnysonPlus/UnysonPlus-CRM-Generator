# Free CRM Website Generator

A free, browser-only tool at **https://crm.unysonplus.com/** that turns a few choices (industry,
pages, content, lead forms, CRM pipeline, brand) into:

- **a build prompt** to paste into an AI coding agent, and
- **`site-spec.json`**, a structured description of the site (also embedded at the end of the prompt).

The agent then builds the site on WordPress with the free Unyson+ framework and its AI Dev Kit.

Guide: https://docs.unysonplus.com/guides/crm-generator ·
Roadmap: https://docs.unysonplus.com/guides/crm-generator-roadmap

## How it is built

One shared engine and one **preset** per industry. `build.mjs` (Node 18+, no dependencies) writes
each preset's page as plain HTML into `dist/`, so search engines read all of it, and GitHub Actions
deploys `dist/` to GitHub Pages on every push to `main`. Nothing is sent to a server: choices are
stored in the visitor's browser and can be shared through a link that packs them into the URL hash.

| Path | What it is |
|---|---|
| `src/presets/<id>.js` | One industry: page copy, pages, content type, lead forms, pipeline, emails, rules, prompt wording |
| `src/assets/engine.js` | Reads the form; builds the spec, the prompt, the preview and the checklist |
| `src/assets/style.css`, `src/assets/img/` | Styles and brand images |
| `src/partials/` | Shared HTML (the hero illustration) |
| `src/static/` | `CNAME`, `robots.txt`, `404.html`, `.nojekyll`, copied as-is |
| `build.mjs` | Builds `dist/`: one page per preset, the industry picker, sitemap and structured data |

```
npm run build     # writes dist/
npm run serve     # builds, then serves dist/ at http://127.0.0.1:8766/
```

## Adding an industry

1. Copy `src/presets/real-estate.js` to `src/presets/<id>.js` and change the `id`, `path`, page copy
   and data. The `id` must match an entry in `INDUSTRIES` in `build.mjs`, which turns its picker
   card from "Coming soon" into a link.
2. Run the build and check the page, the prompt and the preview.
3. Before release, run the prompt on a fresh WordPress install and check the result.

## Spec format

`spec_version` is bumped when the shape of `site-spec.json` changes. `1.1` sections: `business`,
`pages`, one content section named by the preset (`listings`, `services`), `lead_capture`, `crm`,
`brand`, `seo`, `compliance`, `build`, and `missing` (details still needed from the owner).
