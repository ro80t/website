import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

import { SITE_NAME, SITE_DESCRIPTION } from "../../consts";
import { excerptFromHtml } from "../../lib/excerpt";

const articles = await getCollection("articles", ({ data }) => !data.draft);

const pages = Object.fromEntries(
  articles.map((article) => [
    article.id,
    {
      title: article.data.title,
      description:
        article.data.description ?? excerptFromHtml(article.rendered?.html) ?? SITE_DESCRIPTION
    }
  ])
);

// Fallback image used for non-article pages, see Layout.astro.
pages["_site"] = { title: SITE_NAME, description: SITE_DESCRIPTION };

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,

  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    padding: 80,
    logo: {
      path: "./public/icon.png",
      size: [96]
    },
    bgGradient: [
      [15, 23, 42],
      [6, 78, 59]
    ],
    border: {
      color: [0, 250, 154],
      width: 6,
      side: "block-end"
    },
    // Fonts served as a single, non-chunked file covering the full Japanese
    // character set (unlike the @fontsource packages used on the site itself,
    // which split glyphs across many unicode-range files for the browser).
    fonts: [
      "https://api.fontsource.org/v1/fonts/noto-sans-jp/japanese-700-normal.ttf",
      "https://api.fontsource.org/v1/fonts/noto-sans-jp/japanese-400-normal.ttf"
    ],
    font: {
      title: {
        size: 56,
        lineHeight: 1.4,
        weight: "Bold",
        color: [255, 255, 255],
        families: ["Noto Sans JP Thin"]
      },
      description: {
        size: 30,
        lineHeight: 1.6,
        weight: "Normal",
        color: [186, 199, 214],
        families: ["Noto Sans JP Thin"]
      }
    }
  })
});
