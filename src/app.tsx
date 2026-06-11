import { SolidBaseRoot } from "@kobalte/solidbase/client";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import variables from "./styles/variables.module.css";
import "./styles/reset.css";

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
