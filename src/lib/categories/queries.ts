import type { CategoryIndex, CategoryNode } from "./schema";

export interface PostCategoryReference {
  id: string;
  category: string;
}

export function getAncestors(
  index: CategoryIndex,
  categoryId: string,
): CategoryNode[] {
  const ancestors: CategoryNode[] = [];
  let current = index.byId.get(categoryId);

  while (current?.parentId) {
    const parent = index.byId.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

export function getDescendantIds(
  index: CategoryIndex,
  categoryId: string,
): Set<string> {
  const result = new Set<string>();
  const stack = [categoryId];

  while (stack.length > 0) {
    const currentId = stack.pop() as string;
    if (result.has(currentId)) continue;
    const current = index.byId.get(currentId);
    if (!current) continue;
    result.add(currentId);
    stack.push(...[...current.childIds].reverse());
  }

  return result;
}

export function countPostsByCategory(
  index: CategoryIndex,
  categoryIds: string[],
): Map<string, number> {
  const counts = new Map([...index.byId.keys()].map((id) => [id, 0]));

  for (const categoryId of categoryIds) {
    const category = index.byId.get(categoryId);
    if (!category) continue;
    const affected = [...getAncestors(index, categoryId), category];
    for (const node of affected) {
      counts.set(node.id, (counts.get(node.id) ?? 0) + 1);
    }
  }

  return counts;
}

export function validatePostCategories(
  index: CategoryIndex,
  posts: PostCategoryReference[],
): string[] {
  return posts
    .filter((post) => !index.byId.has(post.category))
    .map(
      (post) =>
        `Post ${post.id} references unknown category: ${post.category}`,
    );
}
