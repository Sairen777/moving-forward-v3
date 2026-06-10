import { createSolidBase, defineTheme } from "@kobalte/solidbase/config";
import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin } from "@solidjs/vite-plugin-nitro-2";
import { defineConfig } from "vite";

const theme = defineTheme({
  componentsPath: import.meta.resolve("./src/solidbase-theme"),
});

const solidBase = createSolidBase(theme);

export default defineConfig({
  build: {
    cssCodeSplit: false,
  },
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
    nitroV2Plugin({
      preset: "static",
      prerender: {
        crawlLinks: true,
        routes: ["/", "/writing/the-clean-cutover", "/404"],
      },
    }),
  ],
});
