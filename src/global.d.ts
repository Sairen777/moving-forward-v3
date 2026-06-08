/// <reference types="@solidjs/start/env" />

declare module "*.mdx" {
  import type { Component } from "solid-js";

  export const frontmatter: {
    readonly layout?: string;
    readonly title?: string;
    readonly titleTemplate?: string;
    readonly description?: string;
    readonly date?: string;
    readonly tag?: string;
    readonly readTime?: string;
  };

  const component: Component;
  export default component;
}
