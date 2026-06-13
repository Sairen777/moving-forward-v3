import { createMemo, type ParentProps } from "solid-js";
import { useCurrentPageData } from "@kobalte/solidbase/client";
import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { ArticleShell } from "../components/ArticleShell";
import { clientOnly } from "@solidjs/start";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { isArticlePath, routes, social } from "../lib/routes";

import styles from "./RootLayout.module.css";

const FieldCanvas = clientOnly(() => import("../components/FieldCanvas").then((m) => ({ default: m.FieldCanvas })), {
  lazy: true,
});

type PostFrontmatter = {
  layout?: string;
  title?: string;
  description?: string;
  date?: string;
  tag?: string;
  readTime?: string;
};

export function RootLayout(props: ParentProps) {
  const location = useLocation();
  const pageData = useCurrentPageData();
  const routeState = createMemo(() => {
    const frontmatter = pageData()?.frontmatter as PostFrontmatter | undefined;
    const pathname = location.pathname;

    return {
      animateField: pathname === routes.home,
      frontmatter,
      isArticle: frontmatter?.layout === "post",
      isHome: pathname === routes.home,
      isNotFound: pathname !== routes.home && !isArticlePath(pathname),
    };
  });
  const animateField = createMemo(() => routeState().animateField);

  return (
    <>
      <FieldCanvas animate={animateField} />
      <div class={styles.veil} aria-hidden="true" />
      <div class={styles.root}>
        {routeState().isHome && (
          <>
            <Meta property="og:title" content="moving forward" />
            <Meta property="og:description" content="A field journal about past, present, and moving forward." />
            <Meta property="og:type" content="website" />
            <Meta name="twitter:card" content="summary" />
            <Meta name="twitter:site" content={social.xHandle} />
            <Meta name="twitter:title" content="moving forward" />
            <Meta name="twitter:description" content="A field journal about past, present, and moving forward." />
          </>
        )}
        {routeState().isNotFound && (
          <>
            <Title>not found · moving forward</Title>
            <Meta name="robots" content="noindex" />
          </>
        )}
        <Header />
        <main class={styles.rail}>
          {routeState().isArticle ? (
            <ArticleShell frontmatter={routeState().frontmatter}>{props.children}</ArticleShell>
          ) : (
            props.children
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
