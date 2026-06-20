// Central route + external-link definitions. Import these instead of hardcoding
// paths so navigation targets live in one place.
/** Site-level identity used in page titles and RSS feeds. */
export const SITE_NAME = "moving forward";

/** Canonical base URL. Always HTTPS and no trailing slash. */
export const BASE_URL = "https://movingforward.dev";

/** Default description used for home-page meta and as a fallback. */
export const DEFAULT_DESCRIPTION = "A field journal about past, present, and moving forward.";

/** Path to the social preview image (served from /public). */
export const SOCIAL_IMAGE_PATH = "/social-bg.png";

/** Public path to the RSS feed. */
export const RSS_PATH = "/rss.xml";

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export const routes = {
  /** Site root. */
  home: "/",
  /** Home-page writing section anchor (nav + article back-links). */
  writing: "/#writing",
  /** Home-page about section anchor. */
  about: "/#about",
} as const;

/** Article path prefix; articles live at `/writing/<slug>`. */
const WRITING_BASE = "/writing";

/** Build the route for a writing entry from its slug. */
export function articlePath(slug: string): string {
  return `${WRITING_BASE}/${slug}`;
}

/** Whether a pathname points at a writing entry. */
export function isArticlePath(pathname: string): boolean {
  return pathname.startsWith(`${WRITING_BASE}/`);
}

/** External links rendered around the site. */
export const social = {
  xUrl: "https://x.com/exlinoa",
  xHandle: "@exlinoa",
} as const;
