import { field } from "../lib/field-data";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer class={styles.foot}>
      <span>moving forward</span>
      <span aria-hidden="true">
        regenerated {field.generated} · {field.cols}x{field.rows} · {field.palette.length} colors
      </span>
    </footer>
  );
}
