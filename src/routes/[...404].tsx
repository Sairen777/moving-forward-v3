import { HttpStatusCode } from "@solidjs/start";
import { routes } from "../lib/routes";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section class={styles.notFound}>
      <HttpStatusCode code={404} />
      <p class={styles.kicker}>404</p>
      <h1>Nothing grows here yet.</h1>
      <p class={styles.copy}>The field continues, but this route does not.</p>
      <a class={styles.back} href={routes.home}>
        ← return to the manifest
      </a>
    </section>
  );
}
