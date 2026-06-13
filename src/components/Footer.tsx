import { fieldMeta } from "../lib/field-meta";
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
        regenerated {fieldMeta.generated} · {fieldMeta.cols}x{fieldMeta.rows} · {fieldMeta.palette.length} colors
      </span>
    </footer>
  );
}
