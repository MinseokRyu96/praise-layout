# AGENTS.md

## Project

PraiseLayout is a static web app for Korean worship teams to create praise setlists, upload sheet images/PDFs, mark sections, and export A3 PDF/JPG layouts.

## Stack

- Static HTML/CSS/JS only.
- Source files: `index.html`, `styles.css`, `src/app.js`.
- Build output: `dist/`.
- Build command: `npm run build`.
- Local server: `node server.js 4175`.

## Workflow

- Read this file before making changes.
- Check `git status --short` before editing.
- Prefer `rg` and `sed` for inspection.
- Use `apply_patch` for manual edits.
- Run `npm run build` and `git diff --check` before finishing.
- For UI changes, verify desktop and mobile behavior when possible.
- Do not edit `dist/` directly unless the build process requires it.

## Product Rules

- The first screen is the actual editor, not a marketing landing page.
- Keep the UI quiet, practical, and tool-like.
- Mobile must not overflow horizontally.
- Mobile sheet preview shows songs one at a time as large editable cards.
- PDF/JPG export keeps the A3 output behavior.
- Uploaded files must persist through browser navigation when possible.

## Feature Rules

- Key options are major flat keys only: `C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B`.
- Do not re-add sharp or minor Key options.
- Do not add `Key↑` as a marker. Use the song's modulation Key field.
- Supported markers: `V`, `Ch`, `P.C`, `Br`.
- Uploaded sheet delete controls should work on hover/focus and be visible on mobile.

## Deployment

- GitHub `main` push triggers Vercel deployment.
- Update cache query strings when changing `styles.css` or `src/app.js`.
- Keep AdSense, `ads.txt`, `robots.txt`, and `sitemap.xml` intact.
- Contact email is `mean.seokk@gmail.com`.

## Done When

- Build passes.
- No unintended files changed.
- UI changes do not introduce horizontal overflow.
- The final response mentions what changed and what was verified.
