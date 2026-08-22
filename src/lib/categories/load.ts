import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { normalizeCategories } from "./normalize";
import type { CategoryIndex } from "./schema";

let cachedIndex: CategoryIndex | undefined;

export function loadCategoryIndex(): CategoryIndex {
  if (!cachedIndex) {
    const categoryPath = fileURLToPath(
      new URL("../../data/categories.yml", import.meta.url),
    );
    cachedIndex = normalizeCategories(parse(readFileSync(categoryPath, "utf8")));
  }

  return cachedIndex;
}
