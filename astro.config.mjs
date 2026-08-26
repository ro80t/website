// @ts-check
import { defineConfig } from "astro/config";

// @ts-expect-error this lib dont have .d.ts
import remarkLinkCard from "remark-link-card";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://wktk.moe",
  base: process.env.BASE_PATH || "/",
  image: {
    layout: "constrained"
  },
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"]
      }
    }),
    icon({
      include: {
        "preprocess: vitePreprocess(),": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"]
      }
    }),
    sitemap(),
    mdx()
  ],
  markdown: {
    remarkPlugins: [
      [remarkLinkCard, { shortenUrl: true }],
      remarkMath,
      remarkGithubAdmonitionsToDirectives,
      remarkDirective,
      remarkSectionize
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      rehypeRaw,
      [rehypeExternalLinks, { target: "_blank" }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["anchor"]
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"],
              "data-pagefind-ignore": true
            },
            children: [
              {
                type: "text",
                value: "#"
              }
            ]
          }
        }
      ]
    ]
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
