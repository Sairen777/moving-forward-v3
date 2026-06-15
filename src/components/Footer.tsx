import { activeBackgroundMeta } from "../backgrounds/current";
import { social } from "../lib/routes";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer class={styles.foot}>
      <span>
        moving forward ·{" "}
        <a href={social.xUrl} target="_blank" rel="noreferrer">
          {social.xHandle}
        </a>
      </span>
      <span aria-hidden="true">
        regenerated {activeBackgroundMeta.generated} · {activeBackgroundMeta.cols}x{activeBackgroundMeta.rows} ·{" "}
        {activeBackgroundMeta.palette.length} colors
      </span>
    </footer>
  );
}
