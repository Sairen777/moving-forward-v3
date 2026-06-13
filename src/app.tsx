import { SolidBaseRoot } from "@kobalte/solidbase/client";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
// SolidBase wires the layout in through a virtual module, so the chrome/layout
// styles never reach SolidStart's dev SSR CSS collector and flash in on first
// paint. Statically importing the layout here pulls its module subtree (and
// thus its co-located CSS) into the traversed graph. Build no-op: those styles
// already ship in the always-loaded entry chunk.
import "./layouts/RootLayout";

import variables from "./styles/variables.module.css";

export default function App() {
  return (
    <div class={variables.globals}>
      <Router
        root={(props) => (
          <MetaProvider>
            <SolidBaseRoot meta={{ provider: false }}>{props.children}</SolidBaseRoot>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </div>
  );
}
