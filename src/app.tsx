import { SolidBaseRoot } from "@kobalte/solidbase/client";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import variables from "./styles/variables.module.css";
import "./styles/prose.module.css";
import "./layouts/RootLayout.module.css";
import "./components/ArticleShell.module.css";
import "./components/FieldCanvas.module.css";
import "./components/Footer.module.css";
import "./components/Header.module.css";
import "./components/Manifest.module.css";
import "./components/SectionHeader.module.css";
import "./routes/index.module.css";
import "./routes/not-found.module.css";

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
