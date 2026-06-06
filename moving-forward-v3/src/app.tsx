import { SolidBaseRoot } from "@kobalte/solidbase/client";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./styles/variables.module.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <SolidBaseRoot meta={{ provider: false }}>{props.children}</SolidBaseRoot>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
