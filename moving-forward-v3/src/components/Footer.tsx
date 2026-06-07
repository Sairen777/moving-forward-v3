import { fieldMeta } from "../lib/field-meta";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer class={styles.foot}>
      <span>moving forward</span>
      <span aria-hidden="true">
        regenerated {fieldMeta.generated} · {fieldMeta.cols}x{fieldMeta.rows} · {fieldMeta.palette.length} colors
      </span>
    </footer>
  );
}
