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
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

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
  'https://www.linkedin.com/in/arashsalehkhah/',
  'mailto:me@devarash.icu',
  'https://discord.gg/jxpvnvPg9z',
  'https://nowpayments.io/donation/machinearash',
];

/** How many of the links above leave the site (everything except the mailto). */
const EXTERNAL_LINK_COUNT = EXPECTED_LINKS.filter((href) => href.startsWith('https:')).length;

/**
 * Links that are on the page but are not this person's own profile — a payment
 * processor's page and a community invite — so they must not claim rel="me".
 */
const NON_IDENTITY_HOSTS = ['nowpayments.io', 'discord.gg'];

for (const expectedHref of EXPECTED_LINKS) {
  test(`links to ${expectedHref} exactly once`, () => {
    const occurrences = anchorHrefs.filter((href) => href === expectedHref).length;
    assert.equal(occurrences, 1);
  });
}

test('contains no links beyond the expected set', () => {
  assert.deepEqual([...anchorHrefs].sort(), [...EXPECTED_LINKS].sort());
});

test('every own-profile link declares rel="me", and non-identity links do not', () => {
  const externalAnchors = builtHtml.match(/<a\b[^>]*\bhref="https:[^>]*>/g) ?? [];
  assert.equal(externalAnchors.length, EXTERNAL_LINK_COUNT);
  for (const anchorTag of externalAnchors) {
    if (NON_IDENTITY_HOSTS.some((host) => anchorTag.includes(`//${host}/`))) {
      assert.doesNotMatch(anchorTag, /\brel="[^"]*\bme\b[^"]*"/, anchorTag);
    } else {
      assert.match(anchorTag, /\brel="[^"]*\bme\b[^"]*"/, anchorTag);
    }
  }
});

test('profile links open in a new tab without exposing window.opener', () => {
  const externalAnchors = builtHtml.match(/<a\b[^>]*\bhref="https:[^>]*>/g) ?? [];
  assert.equal(externalAnchors.length, EXTERNAL_LINK_COUNT);
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
  // One per link, the mailto card included.
  assert.equal(noteHooks.length, EXPECTED_LINKS.length);
});

test('the sound toggle ships hidden, so it is never a dead control without JavaScript', () => {
  const toggleTag = builtHtml.match(/<button [^>]*data-sound-toggle[^>]*>/);
  assert.ok(toggleTag, 'sound toggle not found');
  assert.match(toggleTag[0], / hidden[ >=]/);
});

test('the profile picture reserves its box and has alt text', () => {
  const imageTag = builtHtml.match(/<img [^>]*profile[^>]*>/);
  assert.ok(imageTag, 'profile <img> not found');
  assert.match(imageTag[0], / width="144"/);
  assert.match(imageTag[0], / height="144"/);
  assert.match(imageTag[0], / alt="[^"]{10,}"/);
  assert.match(imageTag[0], / srcset="[^"]*288w[^"]*432w/);
});

/*
 * Regression guard for weight. The profile picture's source is a 3 MB PNG; if it
 * is ever dropped back into public/ (or any other large file is), it ships as-is.
 */
test('no file in the build is larger than 100 KB', async () => {
  const distPath = fileURLToPath(new URL('../dist/', import.meta.url));
  const oversized = [];
  for (const entry of await readdir(distPath, { recursive: true })) {
    const fileStat = await stat(join(distPath, entry));
    if (fileStat.isFile() && fileStat.size > 100 * 1024) oversized.push(`${entry} (${fileStat.size} bytes)`);
  }
  assert.deepEqual(oversized, []);
});
