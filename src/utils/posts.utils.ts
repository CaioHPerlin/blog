import { type CollectionEntry } from "astro:content";

export function sortPostsByPublishedAt(
  a: CollectionEntry<"blog">,
  b: CollectionEntry<"blog">
) {
  return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
}

type DateFormatString = "day" | "month" | "monthLong" | "year";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function organizePostsByHeading(
  posts: CollectionEntry<"blog">[],
  format: DateFormatString[],
  separator: string,
  locale: string = "pt-BR"
): Record<string, CollectionEntry<"blog">[]> {
  if (!format || format.length === 0) return {};

  const postsByHeading: Record<string, CollectionEntry<"blog">[]> = {};
  posts.forEach((p) => {
    const date = p.data.publishedAt;

    const dateRecord: Record<DateFormatString, string> = {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      day: date.getDate().toString().padStart(2, "0"),
      monthLong: capitalize(date.toLocaleString(locale, { month: "long" })),
    };

    const formattedString: string = format
      .map((f) => dateRecord[f])
      .join(separator);

    if (!Array.isArray(postsByHeading[formattedString])) {
      postsByHeading[formattedString] = [];
    }

    postsByHeading[formattedString].push(p);
  });

  return postsByHeading;
}
