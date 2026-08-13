import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

import { SITE_DESCRIPTION, SITE_NAME } from "../consts";

export async function GET(context) {
  const posts = await getCollection("articles");
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map(({ data, id }) => ({
      ...data,
      link: `${import.meta.env.BASE_URL}articles/${id}`
    }))
  });
}
