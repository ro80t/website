import { getCollection, getEntry } from "astro:content";
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

const portfolio = await getEntry("specs", "portfolio");
if (portfolio) {
  // specs entries are .mdx (deferred-rendered as components, not pre-rendered
  // HTML) and have no `description` field, so there's no excerpt to pull here
  // — reuse the site-wide description like the `_site` fallback above.
  pages["portfolio"] = { title: portfolio.data.title, description: SITE_DESCRIPTION };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,

  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    padding: 100,
    logo: {
      path: "./public/icon.png",
      size: [96]
    },
    bgGradient: [
      [255, 255, 255],
      [255, 255, 255]
    ],
    border: {
      color: [0, 250, 154],
      width: 6,
      side: "block-end"
    },
    // astro-og-canvas renders server-side, so fonts load as single TTFs covering
    // the full Japanese character set, unlike the @fontsource packages elsewhere
    // on the site which split glyphs across per-unicode-range files for browsers.
    // M PLUS 1 mirrors the site's own body font and reads closer to Zenn/Qiita.
    fonts: [
      "https://api.fontsource.org/v1/fonts/m-plus-1/japanese-700-normal.ttf",
      "https://api.fontsource.org/v1/fonts/m-plus-1/japanese-400-normal.ttf"
    ],
    font: {
      title: {
        size: 64,
        lineHeight: 1.3,
        weight: "Bold",
        color: [17, 24, 39],
        families: ["M PLUS 1 Thin"]
      },
      description: {
        size: 28,
        lineHeight: 1.5,
        weight: "Normal",
        color: [75, 85, 99],
        families: ["M PLUS 1 Thin"]
      }
    }
  })
});
