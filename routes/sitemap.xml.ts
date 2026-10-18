import { defineHandler } from "void";

export const GET = defineHandler((c) =>
  c.body(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${new URL("/", c.req.url)}</loc></url></urlset>`,
    200,
    { "content-type": "application/xml" },
  ),
);
