import { POSTS } from "../lib/posts";
import { absoluteUrl, BASE_URL, DEFAULT_DESCRIPTION, RSS_PATH, SITE_NAME } from "../lib/routes";

/** Parse "YYYY.MM.DD" into an RFC-822 datetime string. */
function toRfc822(dateStr: string): string {
  const [year, month, day] = dateStr.split(".").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${days[date.getUTCDay()]}, ${dd} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} 00:00:00 GMT`;
}

/** Minimal XML escape for text content. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const items = POSTS.map(
    (post) => `
    <item>
      <title>${esc(post.title)}</title>
      <description>${esc(post.description)}</description>
      <link>${absoluteUrl(post.href)}</link>
      <guid isPermaLink="true">${absoluteUrl(post.href)}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
    </item>`,
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <description>${esc(DEFAULT_DESCRIPTION)}</description>
    <link>${BASE_URL}</link>
    <atom:link href="${absoluteUrl(RSS_PATH)}" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
