// Central post registry — every post appears once, sorted newest-first.
// Home and RSS both import from here so the list never drifts.

import { frontmatter as visualizingLife } from "../routes/writing/visualizing-life.mdx";
import { articlePath } from "./routes";

export type Post = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly href: string;
};

export const POSTS: readonly Post[] = [
  {
    slug: "visualizing-life",
    title: visualizingLife.title!,
    description: visualizingLife.description!,
    date: visualizingLife.date!,
    href: articlePath("visualizing-life"),
  },
].sort((a, b) => b.date.localeCompare(a.date));
