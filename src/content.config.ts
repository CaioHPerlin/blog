import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blogPostSchema = z.object({
  title: z.string().min(1),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  isDraft: z.boolean().default(false),
  description: z.string().optional(),
  updatedAt: z.coerce.date().optional(),
  coverImage: z.string().url().optional(),
  youtubeVideoUrl: z.string().url().optional(),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/data/blog/",
  }),
  schema: blogPostSchema,
});

export const collections = { blog };
