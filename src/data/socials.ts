/**
 * Single source of truth for every link on the page.
 *
 * To add, remove, or reorder a profile, edit this file only — the page renders
 * whatever is listed here, in this order.
 *
 * Icons come from `simple-icons` (CC0). This module is only ever imported from
 * Astro frontmatter, so the icon package is a build-time dependency: just the
 * SVG path strings used below end up in the HTML, and no JavaScript ships.
 */
import {
  siBitcoin,
  siDiscord,
  siGithub,
  siInstagram,
  siKick,
  siTiktok,
  siTwitch,
  siX,
  siYoutube,
} from 'simple-icons';

/** One card on the page. */
export interface SocialProfile {
  /** Stable key, also used as a hook for tests and styling. */
  id: string;
  /** Platform name as displayed on the card. */
  platformName: string;
  /** Handle as displayed, including the `@` where the platform uses one. */
  displayHandle: string;
  /** Absolute URL of the profile. */
  profileUrl: string;
  /** `d` attribute of a 24×24 single-path SVG icon. */
  iconPath: string;
}

/** Handle shared by every streaming and social platform. */
const STREAMER_HANDLE = 'machinearash';

/** GitHub lives under a different name than the streaming handle. */
const GITHUB_HANDLE = 'devarashs';

/** Platforms that share {@link STREAMER_HANDLE}, in display order. */
export const channelProfiles: readonly SocialProfile[] = [
  {
    id: 'twitch',
    platformName: 'Twitch',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://www.twitch.tv/${STREAMER_HANDLE}`,
    iconPath: siTwitch.path,
  },
  {
    id: 'kick',
    platformName: 'Kick',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://kick.com/${STREAMER_HANDLE}`,
    iconPath: siKick.path,
  },
  {
    id: 'youtube',
    platformName: 'YouTube',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://www.youtube.com/@${STREAMER_HANDLE}`,
    iconPath: siYoutube.path,
  },
  {
    id: 'tiktok',
    platformName: 'TikTok',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://www.tiktok.com/@${STREAMER_HANDLE}`,
    iconPath: siTiktok.path,
  },
  {
    id: 'instagram',
    platformName: 'Instagram',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://www.instagram.com/${STREAMER_HANDLE}`,
    iconPath: siInstagram.path,
  },
  {
    id: 'x',
    platformName: 'X',
    displayHandle: `@${STREAMER_HANDLE}`,
    profileUrl: `https://x.com/${STREAMER_HANDLE}`,
    iconPath: siX.path,
  },
];

/**
 * LinkedIn glyph on the 24×24 grid. simple-icons removed LinkedIn at the brand's
 * request, so unlike the other brand icons this path is kept here by hand.
 */
const linkedinIconPath =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z' +
  'M5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065z' +
  'M7.119 20.452H3.555V9h3.564v11.452z' +
  'M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

/** Professional profiles, shown above the contact card. */
export const professionalProfiles: readonly SocialProfile[] = [
  {
    id: 'github',
    platformName: 'GitHub',
    displayHandle: `@${GITHUB_HANDLE}`,
    profileUrl: `https://github.com/${GITHUB_HANDLE}`,
    iconPath: siGithub.path,
  },
  {
    id: 'linkedin',
    platformName: 'LinkedIn',
    displayHandle: 'in/arashsalehkhah',
    profileUrl: 'https://www.linkedin.com/in/arashsalehkhah/',
    iconPath: linkedinIconPath,
  },
];

/**
 * Discord server invite.
 *
 * Like the donation link below it is card-shaped but not a profile — an invite
 * points at a community, not at a person — so render it with
 * `declaresIdentity={false}`.
 *
 * Discord invites expire after 7 days unless created with "Expire after: Never".
 * If this card starts landing on "Invite Invalid", that is why: generate a
 * permanent invite and replace the code here and in the tests.
 */
export const discordInvite: SocialProfile = {
  id: 'discord',
  platformName: 'Discord',
  displayHandle: 'Join the server',
  profileUrl: 'https://discord.gg/jxpvnvPg9z',
  iconPath: siDiscord.path,
};

/**
 * Crypto donation page, hosted by NOWPayments.
 *
 * Shaped like a profile so it can wear the same card, but it is not one: render
 * it with `declaresIdentity={false}` so it does not get `rel="me"`. The URL is
 * where people send money — it is pinned literally in the tests, so a change
 * here must be a deliberate change there too.
 */
export const donationLink: SocialProfile = {
  id: 'donate',
  platformName: 'Donate crypto',
  displayHandle: 'via NOWPayments',
  profileUrl: `https://nowpayments.io/donation/${STREAMER_HANDLE}`,
  iconPath: siBitcoin.path,
};

/** Public contact address. Published deliberately; it is meant to be found. */
export const contactEmail = 'me@devarash.icu';

/**
 * Envelope glyph on the same 24×24 grid as the brand icons. simple-icons only
 * carries brands, so this one generic icon is drawn here. Uses the even-odd fill
 * rule: the inner sub-paths cut the envelope body out of the outer rectangle.
 */
export const emailIconPath =
  'M3 4.5h18A1.5 1.5 0 0 1 22.5 6v12a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18V6A1.5 1.5 0 0 1 3 4.5Z' +
  'M3.5 8.1v9.4h17V8.1L12 14 3.5 8.1Z' +
  'M4.6 6.5 12 11.6l7.4-5.1H4.6Z';
