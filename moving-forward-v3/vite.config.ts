import { createSolidBase, defineTheme } from "@kobalte/solidbase/config";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const theme = defineTheme({
  componentsPath: import.meta.resolve("./src/solidbase-theme"),
});

const solidBase = createSolidBase(theme);

const manualStaticBuild = process.env.MF_MANUAL_SSG === "1";

export default defineConfig({
  plugins: [
    solidBase.plugin({
      title: "moving forward",
      description: "A field journal on building, learning, and moving forward.",
      lang: "en",
      lastUpdated: false,
      markdown: {
        expressiveCode: false,
      },
    }),
    solidStart(solidBase.startConfig({ ssr: true })),
    ...(manualStaticBuild
      ? []
      : [
          nitro({
            static: true,
            prerender: {
              crawlLinks: true,
              routes: ["/", "/writing/the-clean-cutover", "/404"],
            },
          }),
        ]),
  ],
});
