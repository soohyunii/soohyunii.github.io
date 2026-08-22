import type { CollectionEntry } from "astro:content";
import type { CategoryIndex } from "../categories/schema";
import { getDescendantIds } from "../categories/queries";

export interface BlogPostData {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  draft: boolean;
  slug?: string;
}

export interface BlogPost {
  id: string;
  data: BlogPostData;
}

export function filterAndSortPublishedPosts<T extends BlogPost>(posts: T[]): T[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort(
      (left, right) =>
        right.data.publishedAt.getTime() - left.data.publishedAt.getTime(),
    );
}

export function filterPostsForCategory<T extends BlogPost>(
  posts: T[],
  index: CategoryIndex,
  categoryId: string,
  includeDescendants: boolean,
): T[] {
  const categoryIds = includeDescendants
    ? getDescendantIds(index, categoryId)
    : new Set([categoryId]);

  return filterAndSortPublishedPosts(posts).filter((post) =>
    categoryIds.has(post.data.category),
  );
}

export async function getPublishedPosts(): Promise<CollectionEntry<"posts">[]> {
  const { getCollection } = await import("astro:content");
  return filterAndSortPublishedPosts(await getCollection("posts"));
}

export async function getPostsForCategory(
  index: CategoryIndex,
  categoryId: string,
  includeDescendants: boolean,
): Promise<CollectionEntry<"posts">[]> {
  const { getCollection } = await import("astro:content");
  return filterPostsForCategory(
    await getCollection("posts"),
    index,
    categoryId,
    includeDescendants,
  );
}
