import { splitProps, type ComponentProps } from "solid-js";
import styles from "../styles/prose.module.css";

export function h2(props: ComponentProps<"h2">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.heading} ${local.class}` : styles.heading;

  return <h2 {...rest} class={className} />;
}

export function p(props: ComponentProps<"p">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.paragraph} ${local.class}` : styles.paragraph;

  return <p {...rest} class={className} />;
}

export function a(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.link} ${local.class}` : styles.link;

  return <a {...rest} class={className} />;
}

export function code(props: ComponentProps<"code">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.inlineCode} ${local.class}` : styles.inlineCode;

  return <code {...rest} class={className} />;
}

export function pre(props: ComponentProps<"pre">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.codeBlock} ${local.class}` : styles.codeBlock;

  return <pre {...rest} class={className} />;
}

export function blockquote(props: ComponentProps<"blockquote">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.blockquote} ${local.class}` : styles.blockquote;

  return <blockquote {...rest} class={className} />;
}

export function ul(props: ComponentProps<"ul">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.list} ${local.class}` : styles.list;

  return <ul {...rest} class={className} />;
}

export function li(props: ComponentProps<"li">) {
  const [local, rest] = splitProps(props, ["class"]);
  const className = local.class ? `${styles.listItem} ${local.class}` : styles.listItem;

  return <li {...rest} class={className} />;
}
