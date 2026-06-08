import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  meta: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <div class={styles.section}>
      <h2>{props.title}</h2>
      <span class={styles.leader} aria-hidden="true" />
      <span>{props.meta}</span>
    </div>
  );
}
