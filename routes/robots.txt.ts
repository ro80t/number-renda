import { defineHandler } from "void";

export const GET = defineHandler((c) =>
  c.text(`User-agent: *\nDisallow:\n\nSitemap: ${new URL("/sitemap.xml", c.req.url)}\n`),
);
