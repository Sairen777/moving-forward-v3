import type { ParentProps } from "solid-js";
import { RootLayout } from "../layouts/RootLayout";

export default function Layout(props: ParentProps) {
  return <RootLayout>{props.children}</RootLayout>;
}
