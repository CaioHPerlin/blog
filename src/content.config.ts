import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
const postSchema = z.object({
  isDraft: z.boolean().default(false),
  title: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()),
  updatedAt: z.coerce.date().optional(),
  coverImage: z.string().optional(),
  youtubeVideoUrl: z.string().optional(),
  description: z.string().optional(), // SEO
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/data/blog/",
  }),
  schema: postSchema,
});

export const collections = { blog };
