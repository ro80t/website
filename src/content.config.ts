import { defineCollection, z } from "astro:content";

export const collections = {
  articles: defineCollection({
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
    schema: z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date()
    })
  })
};
