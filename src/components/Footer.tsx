import { activeBackgroundMeta } from "../backgrounds/current";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer class={styles.foot}>
      <span>moving forward</span>
      <span class={styles.stamp} aria-hidden="true">
        regenerated {activeBackgroundMeta.generated} · {activeBackgroundMeta.cols}x{activeBackgroundMeta.rows} ·{" "}
        {activeBackgroundMeta.palette.length} colors
      </span>
    </footer>
  );
}
