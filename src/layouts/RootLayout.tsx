import { useCurrentPageData } from "@kobalte/solidbase/client";
import { Link, Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { createMemo, type ParentProps } from "solid-js";
import { ArticleShell } from "../components/ArticleShell";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { SiteBackground } from "../components/SiteBackground";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  isArticlePath,
  RSS_PATH,
  routes,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
} from "../lib/routes";

import styles from "./RootLayout.module.css";

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
      <SiteBackground animate={animateField} />
      <div class={styles.veil} aria-hidden="true" />
      <div class={styles.root}>
        {routeState().isHome && (
          <>
            <Link rel="canonical" href={absoluteUrl(routes.home)} />
            <Meta property="og:title" content={SITE_NAME} />
            <Meta property="og:description" content={DEFAULT_DESCRIPTION} />
            <Meta property="og:url" content={absoluteUrl(routes.home)} />
            <Meta property="og:image" content={absoluteUrl(SOCIAL_IMAGE_PATH)} />
            <Meta property="og:type" content="website" />
            <Meta name="twitter:card" content="summary_large_image" />
            <Meta name="twitter:title" content={SITE_NAME} />
            <Meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
            <Meta name="twitter:image" content={absoluteUrl(SOCIAL_IMAGE_PATH)} />
          </>
        )}
        {routeState().isNotFound && (
          <>
            <Title>not found · moving forward</Title>
            <Meta name="robots" content="noindex" />
          </>
        )}
        <Link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS`} href={absoluteUrl(RSS_PATH)} />
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
