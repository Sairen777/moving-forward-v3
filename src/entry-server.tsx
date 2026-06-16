// @refresh reload
import { getHtmlProps } from "@kobalte/solidbase/server";
import { createHandler, StartServer } from "@solidjs/start/server";

import baseCss from "./styles/reset.css?inline";
import variablesCss from "./styles/variables.css?inline";

/**
 * Inline script that resolves the active theme before first paint.
 * Reads localStorage; if unset, mirrors the OS preference. Runs
 * synchronously in <head> so the correct data-theme is applied
 * before the body renders — no flash of wrong colors.
 */
const themeScript = `(function(){var d=document.documentElement,s=d.style,t=localStorage.getItem("theme"),m=window.matchMedia("(prefers-color-scheme:dark)");function a(v){d.dataset.theme=v;s.colorScheme=v;var c=document.querySelector('meta[name="theme-color"]');if(c)c.content=v==="dark"?"#0a1018":"#ffffff"}if(t==="dark"||t==="light"){a(t)}else{a(m.matches?"dark":"light");m.addEventListener("change",function(e){if(!localStorage.getItem("theme"))a(e.matches?"dark":"light")})}})()`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html {...getHtmlProps()} data-theme="light">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <meta name="theme-color" content="#ffffff" />
          <style innerHTML={variablesCss} />
          <style innerHTML={baseCss} />
          <script innerHTML={themeScript} />
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
