import { defineHead } from "void";

const TITLE = "数字連打 - 数字タイピング練習ゲーム";
const DESC =
  "上段キー・テンキーで表示された数字を60秒間打ち続ける数字連打ゲーム。初級・中級・上級とカスタム桁数で、テンキーやナンバーキーのタイピング速度と正確率を鍛えられます。";

export const head = defineHead((c) => {
  const url = new URL("/", c.req.url).toString();
  return {
    title: TITLE,
    meta: [
      { name: "description", content: DESC },
      { name: "keywords", content: "数字連打,テンキー,タイピング練習,数字入力,タイピングゲーム" },
      { name: "theme-color", content: "#00fa9a" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:site_name", content: "数字連打" },
      { property: "og:locale", content: "ja_JP" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    link: [{ rel: "canonical", href: url }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "数字連打",
          description: DESC,
          url,
          inLanguage: "ja",
          applicationCategory: "GameApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        }),
      },
    ],
  };
});
