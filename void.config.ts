import { defineConfig } from "void/config";

export default defineConfig({
  head: { htmlAttrs: { lang: "ja" } },
  worker: { compatibility_date: "2026-09-26", compatibility_flags: ["nodejs_compat"] },
  cloudflare: { name: "number-renda" },
});
