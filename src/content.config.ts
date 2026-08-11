import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date(),
      url: z.string().optional(),
      draft: z.boolean().optional().default(false),
      tags: z.string().array().optional().default([]),
      image: z.string().optional()
    })
  }),
  specs: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/specs" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date()
    })
  })
};
