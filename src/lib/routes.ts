// Central route + external-link definitions. Import these instead of hardcoding
// paths so navigation targets live in one place.

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
