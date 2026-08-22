import type {
  CategoryIndex,
  CategoryInput,
  CategoryNode,
} from "./schema";

const RESERVED_ROOT_SLUGS = new Set([
  "posts",
  "tags",
  "archive",
  "about",
  "search",
]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertCategory(value: unknown): asserts value is CategoryInput {
  if (!value || typeof value !== "object") {
    throw new Error("Category must be an object");
  }

  const category = value as Record<string, unknown>;
  for (const field of ["id", "name", "slug"] as const) {
    if (typeof category[field] !== "string" || !category[field].trim()) {
      throw new Error(`Category ${field} must be a non-empty string`);
    }
  }

  if (!SLUG_PATTERN.test(category.slug as string)) {
    throw new Error(`Invalid category slug: ${category.slug as string}`);
  }

  if (category.children !== undefined && !Array.isArray(category.children)) {
    throw new Error(`Category children must be an array: ${category.id as string}`);
  }
}

export function normalizeCategories(input: unknown): CategoryIndex {
  if (!input || typeof input !== "object") {
    throw new Error("Category configuration must be an object");
  }

  const categories = (input as { categories?: unknown }).categories;
  if (!Array.isArray(categories)) {
    throw new Error("Category configuration must contain a categories array");
  }

  const index: CategoryIndex = {
    roots: [],
    byId: new Map<string, CategoryNode>(),
    byPath: new Map<string, CategoryNode>(),
  };

  const visit = (
    values: unknown[],
    parent: CategoryNode | null,
  ): string[] => {
    const siblingSlugs = new Set<string>();
    const childIds: string[] = [];

    for (const value of values) {
      assertCategory(value);

      if (index.byId.has(value.id)) {
        throw new Error(`Duplicate category id: ${value.id}`);
      }
      if (siblingSlugs.has(value.slug)) {
        throw new Error(`Duplicate sibling slug: ${value.slug}`);
      }
      if (!parent && RESERVED_ROOT_SLUGS.has(value.slug)) {
        throw new Error(`Reserved root category slug: ${value.slug}`);
      }

      siblingSlugs.add(value.slug);
      const path = parent ? `${parent.path}/${value.slug}` : value.slug;
      const node: CategoryNode = {
        id: value.id,
        name: value.name,
        slug: value.slug,
        description: value.description,
        projectUrl: value.projectUrl,
        parentId: parent?.id ?? null,
        childIds: [],
        depth: parent ? parent.depth + 1 : 0,
        path,
      };

      index.byId.set(node.id, node);
      index.byPath.set(node.path, node);
      node.childIds = visit(value.children ?? [], node);
      childIds.push(node.id);
    }

    return childIds;
  };

  index.roots = visit(categories, null);
  return index;
}
