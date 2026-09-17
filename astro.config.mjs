import { defineConfig } from 'astro/config';

// Static output with no adapter: Cloudflare Pages serves `dist/` as plain files.
export default defineConfig({
  // The production domain is not fixed yet. When SITE_URL is unset Astro leaves
  // `Astro.site` undefined and the layout skips the canonical/og:url tags rather
  // than publishing a wrong absolute URL.
  site: process.env.SITE_URL || undefined,

  build: {
    // One page, one small stylesheet: inlining it removes the only
    // render-blocking request. The CSP below hashes the inlined block.
    inlineStylesheets: 'always',
  },

  // No Markdown on this site. Astro's default highlighter (Shiki) emits inline
  // styles, which the CSP below forbids, and Astro warns about it on every build.
  markdown: {
    syntaxHighlight: false,
  },

  security: {
    // Emits a <meta http-equiv="content-security-policy"> with hashes for every
    // script and style Astro bundles, so no 'unsafe-inline' is needed.
    // `frame-ancestors` cannot be set from a meta tag; it lives in public/_headers.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
});
