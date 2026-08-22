import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { normalizeCategories } from "./normalize";
import type { CategoryIndex } from "./schema";

let cachedIndex: CategoryIndex | undefined;

export function loadCategoryIndex(): CategoryIndex {
  if (!cachedIndex) {
    const categoryPath = resolve(process.cwd(), "src/data/categories.yml");
    cachedIndex = normalizeCategories(parse(readFileSync(categoryPath, "utf8")));
  }

  return cachedIndex;
}
