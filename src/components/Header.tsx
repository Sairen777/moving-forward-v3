import { routes } from "../lib/routes";
import { ThemeToggle } from "./ThemeToggle";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header class={styles.top}>
      <div class={styles.inner}>
        <a class={styles.brand} href={routes.home}>
          moving forward
          <span class={styles.cursor} aria-hidden="true">
            _
          </span>
        </a>
        <nav class={styles.nav} aria-label="Primary">
          {/*<a href={routes.writing}>/writing</a>*/}
          {/*<a href={routes.about}>/about</a>*/}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
