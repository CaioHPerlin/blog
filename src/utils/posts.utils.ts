import { type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const DEFAULT_LOCALE = "pt-BR";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function filterDraftPosts(post: BlogPost): boolean {
  return !post.data.isDraft;
}

export function sortPostsByPublishedAt(a: BlogPost, b: BlogPost): number {
  return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
}

export function formatDate(
  date: Date,
  locale: string = DEFAULT_LOCALE
): string {
  const day = date.getDate();
  const month = capitalize(date.toLocaleDateString(locale, { month: "long" }));
  const year = date.getFullYear();

  return `${day} de ${month} de ${year}`;
}
