import styles from "./Header.module.css";

export function Header() {
  return (
    <header class={styles.top}>
      <div class={styles.inner}>
        <a class={styles.brand} href="/">
          moving forward
          <span class={styles.cursor} aria-hidden="true">
            _
          </span>
        </a>
        <nav class={styles.nav} aria-label="Primary">
          <a href="/#writing">/writing</a>
          <a href="/#notes">/notes</a>
          <a href="/#about">/about</a>
        </nav>
      </div>
    </header>
  );
}
