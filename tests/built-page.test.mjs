/**
 * Checks the built page, not the source: the failure that matters for a socials
 * hub is a visitor landing on the wrong profile, so these assertions read
 * `dist/index.html` exactly as Cloudflare will serve it.
 *
 * The expected URLs are written out literally instead of imported from
 * `src/data/socials.ts`. Importing them would only prove the data file agrees
 * with itself; a typo there has to fail here.
 *
 * Run with `npm test`, which builds first.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const builtHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

/** Every `href` on an <a> in the built page, in document order. */
const anchorHrefs = [...builtHtml.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((match) => match[1]);

const EXPECTED_LINKS = [
  'https://www.twitch.tv/machinearash',
  'https://kick.com/machinearash',
  'https://www.youtube.com/@machinearash',
  'https://www.tiktok.com/@machinearash',
  'https://www.instagram.com/machinearash',
  'https://x.com/machinearash',
  'https://github.com/devarashs',
  'mailto:me@devarash.icu',
  'https://nowpayments.io/donation/machinearash',
];

/** The donation page belongs to a payment processor, so it must not claim rel="me". */
const DONATION_HOST = 'nowpayments.io';

for (const expectedHref of EXPECTED_LINKS) {
  test(`links to ${expectedHref} exactly once`, () => {
    const occurrences = anchorHrefs.filter((href) => href === expectedHref).length;
    assert.equal(occurrences, 1);
  });
}

test('contains no links beyond the expected set', () => {
  assert.deepEqual([...anchorHrefs].sort(), [...EXPECTED_LINKS].sort());
});

test('every own-profile link declares rel="me", and the donation link does not', () => {
  const externalAnchors = builtHtml.match(/<a\b[^>]*\bhref="https:[^>]*>/g) ?? [];
  assert.equal(externalAnchors.length, 8);
  for (const anchorTag of externalAnchors) {
    if (anchorTag.includes(DONATION_HOST)) {
      assert.doesNotMatch(anchorTag, /\brel="[^"]*\bme\b[^"]*"/, anchorTag);
    } else {
      assert.match(anchorTag, /\brel="[^"]*\bme\b[^"]*"/, anchorTag);
    }
  }
});

test('profile links open in a new tab without exposing window.opener', () => {
  const externalAnchors = builtHtml.match(/<a\b[^>]*\bhref="https:[^>]*>/g) ?? [];
  assert.equal(externalAnchors.length, 8);
  for (const anchorTag of externalAnchors) {
    assert.match(anchorTag, /\btarget="_blank"/, anchorTag);
    assert.match(anchorTag, /\brel="[^"]*\bnoopener\b[^"]*"/, anchorTag);
  }
});

test('the mailto link stays in the current tab', () => {
  const mailtoAnchor = builtHtml.match(/<a\b[^>]*\bhref="mailto:[^>]*>/);
  assert.ok(mailtoAnchor, 'mailto link not found');
  assert.doesNotMatch(mailtoAnchor[0], /\btarget=/);
});

test('has exactly one <h1>, and it is the handle', () => {
  const headings = builtHtml.match(/<h1\b[\s\S]*?<\/h1>/g) ?? [];
  assert.equal(headings.length, 1);
  assert.match(headings[0], /machinearash/);
});

test('ships a hash-based CSP with no unsafe-inline', () => {
  const cspMeta = builtHtml.match(/<meta[^>]*http-equiv="content-security-policy"[^>]*>/i);
  assert.ok(cspMeta, 'CSP <meta> tag is missing');
  assert.match(cspMeta[0], /script-src[^;]*'sha256-/);
  assert.match(cspMeta[0], /style-src[^;]*'sha256-/);
  assert.doesNotMatch(cspMeta[0], /unsafe-inline/);
});

test('uses no inline style attributes, which the CSP would block', () => {
  assert.doesNotMatch(builtHtml, /\sstyle="/);
});

test('loads nothing from a third-party origin', () => {
  const resourceUrls = [...builtHtml.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]*)"/g)].map(
    (match) => match[1],
  );
  for (const resourceUrl of resourceUrls) {
    assert.doesNotMatch(resourceUrl, /^(?:https?:)?\/\//, `third-party resource: ${resourceUrl}`);
  }
});

/*
 * Regression: the title's glitch once shipped dead. Its duration was set with a
 * nameless `animation:` shorthand, which the CSS minifier rewrote to
 * `animation: none` — fine in dev, zero-length in the production build.
 */
test('minifier has not disabled the glitch title animation', () => {
  const sliceRule = builtHtml.match(/\.glitch-title__slice\[[^\]]*\]\{[^}]*\}/);
  assert.ok(sliceRule, 'glitch slice rule not found in built CSS');
  assert.doesNotMatch(sliceRule[0], /animation:none/);
  assert.match(sliceRule[0], /animation-duration:\.52s/);
});

test('every card is wired to play a hover note', () => {
  const noteHooks = builtHtml.match(/<(?:a|div) [^>]*data-hover-note[^>]*>/g) ?? [];
  // 6 channels + GitHub + email + donation.
  assert.equal(noteHooks.length, 9);
});

test('the sound toggle ships hidden, so it is never a dead control without JavaScript', () => {
  const toggleTag = builtHtml.match(/<button [^>]*data-sound-toggle[^>]*>/);
  assert.ok(toggleTag, 'sound toggle not found');
  assert.match(toggleTag[0], / hidden[ >=]/);
});
