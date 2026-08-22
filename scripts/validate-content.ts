import { relative } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { readFile } from "node:fs/promises";
import { loadCategoryIndex } from "../src/lib/categories/load";
import { validatePostCategories } from "../src/lib/categories/queries";

const paths = await fg("src/content/posts/**/*.{md,mdx}");
const posts = await Promise.all(
  paths.map(async (path) => {
    const { data } = matter(await readFile(path, "utf8"));
    return {
      id: relative("src/content/posts", path).replace(/\\/g, "/"),
      category: typeof data.category === "string" ? data.category : "",
      slug: typeof data.slug === "string" ? data.slug : undefined,
    };
  }),
);

const errors = validatePostCategories(loadCategoryIndex(), posts);
const slugOwners = new Map<string, string>();

for (const post of posts) {
  if (!post.slug) continue;
  const owner = slugOwners.get(post.slug);
  if (owner) {
    errors.push(`Duplicate post slug ${post.slug}: ${owner}, ${post.id}`);
  } else {
    slugOwners.set(post.slug, post.id);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log("Content validation passed");
}
