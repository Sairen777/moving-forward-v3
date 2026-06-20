import { activeBackgroundMeta } from "../backgrounds/current";
import { absoluteUrl, RSS_PATH } from "../lib/routes";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer class={styles.foot}>
      <span>
        moving forward · <a href={absoluteUrl(RSS_PATH)}>rss</a>
      </span>
      <span class={styles.stamp} aria-hidden="true">
        regenerated {activeBackgroundMeta.generated} · {activeBackgroundMeta.cols}x{activeBackgroundMeta.rows} ·{" "}
        {activeBackgroundMeta.palette.length} colors
      </span>
    </footer>
  );
}
