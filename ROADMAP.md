# Roadmap

Socials hub for **machinearash** — one static page, retro cyberpunk mood, hosted on
Cloudflare Pages. Stack: Astro (static output, no UI framework, no adapter).

## Assumptions

Stated so they can be corrected; none of them changes the task list if wrong.

- Profile URLs follow each platform's standard pattern for the handle `machinearash`
  (`github.com/devarashs` for GitHub). Single source: `src/data/socials.ts`.
- Dark theme only. A cyberpunk page has no meaningful light variant.
- The production domain is not decided, so the canonical URL is only emitted when
  `SITE_URL` is set at build time.
- No analytics, no third-party scripts, no web-font CDN (fonts are self-hosted).
- "Streamer mode" was a typo for streamer *mood* — there is no privacy toggle, live
  badge, or OBS overlay in scope.

## Phase 1 — Foundations

- [x] Astro project builds to static `dist/` with strict TypeScript
- [x] Design tokens (colour, type, spacing, radius, motion) defined once and used everywhere

## Phase 2 — The page

- [x] Visitors see every social as a card linking to the right profile
- [x] Visitors can email or copy the contact address
- [x] The page has the retro cyberpunk mood: neon grid backdrop, scanlines, glitch title
- [x] Motion is smooth, compositor-only, and off under `prefers-reduced-motion`
- [x] Link previews and search engines get a title, description, and icon

## Phase 3 — Ship

- [x] Every configured profile URL is proven present in the built HTML (automated test)
- [ ] Cloudflare Pages serves it with security headers and a pinned Node version
      Config is written (`public/_headers`, `.nvmrc`) but not yet deployed, so the
      headers have not been observed on a live response. Needs the Pages project
      connected; see README.
- [x] Verified in a real browser at phone and desktop widths
- [x] README documents local dev, editing links, and the Cloudflare Pages settings

## Later — noticed, not agreed

Not in scope for the first version. Listed so they are not lost.

- Social share image (`og:image`). Link previews currently show text only. Needs a
  1200×630 asset and `SITE_URL` set, since `og:image` must be an absolute URL.
- Live badge on the Twitch/Kick cards. Would need a Pages Function and API credentials.
