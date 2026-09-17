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

/** Developer profile, shown beside the contact card. */
export const codeProfile: SocialProfile = {
  id: 'github',
  platformName: 'GitHub',
  displayHandle: `@${GITHUB_HANDLE}`,
  profileUrl: `https://github.com/${GITHUB_HANDLE}`,
  iconPath: siGithub.path,
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
