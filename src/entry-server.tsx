// @refresh reload
import { getHtmlProps } from "@kobalte/solidbase/server";
import { createHandler, StartServer } from "@solidjs/start/server";

import baseCss from "./styles/reset.css?inline";
import variablesCss from "./styles/variables.css?inline";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html {...getHtmlProps()} data-theme="system">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <meta name="theme-color" content="#ffffff" />
          <style innerHTML={variablesCss} />
          <style innerHTML={baseCss} />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
