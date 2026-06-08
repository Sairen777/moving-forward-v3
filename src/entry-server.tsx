// @refresh reload
import { getHtmlProps } from "@kobalte/solidbase/server";
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html {...getHtmlProps()} data-theme="system">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="icon"
            href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20fill='%23ffffff'/%3E%3Ctext%20x='3.5'%20y='24'%20font-family='ui-monospace,monospace'%20font-size='22'%20font-weight='700'%20fill='%2327221b'%3Em%3C/text%3E%3Crect%20x='21'%20y='10'%20width='6'%20height='14'%20fill='%23d8a848'/%3E%3C/svg%3E"
          />
          <meta name="theme-color" content="#ffffff" />
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
