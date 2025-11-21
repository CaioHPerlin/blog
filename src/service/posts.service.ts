import { getCollection, type CollectionEntry } from "astro:content";

function sortByPublishedAt(
  a: CollectionEntry<"blog">,
  b: CollectionEntry<"blog">
) {
  return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
}

export async function getAllPosts() {
  const posts = await getCollection("blog");

  return posts.sort(sortByPublishedAt);
}
