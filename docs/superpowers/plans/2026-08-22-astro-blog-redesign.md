# Astro Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Jekyll Chirpy site with a custom Astro blog whose primary navigation is a manually maintained, arbitrary-depth category tree.

**Architecture:** Astro statically renders Markdown/MDX content for GitHub Pages. A YAML category tree is normalized once into a typed index consumed by routes, breadcrumbs, counts, and navigation; Pagefind indexes the final HTML after the Astro build.

**Tech Stack:** Astro 7.2, TypeScript, Astro Content Collections, YAML, Vitest, Playwright, Pagefind Extended, pnpm, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-08-22-astro-blog-redesign-design.md`

## Global Constraints

- One post belongs to exactly one primary category; tags are optional secondary associations.
- Category IDs are stable references; display names and tree position may change without editing posts.
- `src/data/categories.yml` is the only manually maintained category source.
- Category nesting has no application-level depth limit.
- Parent category pages aggregate posts from all descendants; leaf pages show directly assigned posts.
- Desktop navigation uses a fixed left category sidebar; mobile uses the same tree in a drawer.
- Search is always reachable and indexes title, description, body, category, and tags.
- Tags remain visible but visually subordinate to navigation, titles, and body content.
- Private categories are not implemented.
- Final colors and fonts are deferred; components use semantic design tokens from the first implementation.
- The public site remains `https://soohyunii.github.io` with `base: "/"`.
- Node 24 and pnpm are used locally and in CI; `pnpm-lock.yaml` is committed.

## Planned File Structure

```text
.
├── astro.config.mjs                 Astro, MDX, sitemap, and site configuration
├── package.json                     scripts and pinned dependency ranges
├── pnpm-lock.yaml                   reproducible dependency graph
├── tsconfig.json                    strict Astro TypeScript settings
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── scripts/
│   └── validate-content.ts          CLI validation before build
├── src/
│   ├── content.config.ts            post collection schema
│   ├── content/posts/               Markdown and MDX posts
│   ├── data/categories.yml          category source of truth
│   ├── lib/categories/
│   │   ├── schema.ts                category input and normalized types
│   │   ├── normalize.ts             validation and normalized index creation
│   │   ├── queries.ts               ancestry, descendants, paths, and counts
│   │   └── load.ts                  YAML loading and singleton access
│   ├── lib/content/posts.ts         published-post filtering and sorting
│   ├── components/navigation/
│   │   ├── CategoryTree.astro
│   │   ├── SearchTrigger.astro
│   │   ├── Sidebar.astro
│   │   ├── MobileDrawer.astro
│   │   └── Breadcrumbs.astro
│   ├── components/post/
│   │   ├── PostCard.astro
│   │   ├── PostMeta.astro
│   │   ├── TagList.astro
│   │   └── TableOfContents.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── archive.astro
│   │   ├── search.astro
│   │   ├── tags/index.astro
│   │   ├── tags/[tag].astro
│   │   ├── category/[...path].astro
│   │   └── posts/[slug].astro
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── prose.css
├── tests/
│   ├── categories/normalize.test.ts
│   ├── categories/queries.test.ts
│   ├── content/posts.test.ts
│   ├── routes/routes.test.ts
│   └── e2e/blog.spec.ts
└── .github/workflows/pages-deploy.yml
```

---

### Task 1: Astro foundation and reproducible toolchain

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `tests/smoke/config.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: pnpm scripts `dev`, `build:astro`, `build`, `preview`, `check`, `test`, `test:e2e`, and `validate`.
- Produces: semantic CSS tokens consumed by every later component.

- [ ] **Step 1: Add the failing configuration test**

```ts
// tests/smoke/config.test.ts
import { describe, expect, it } from "vitest";
import config from "../../astro.config.mjs";

describe("Astro configuration", () => {
  it("targets the GitHub user site", () => {
    expect(config.site).toBe("https://soohyunii.github.io");
    expect(config.base).toBe("/");
    expect(config.output).toBe("static");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the Astro config does not exist**

Run: `pnpm exec vitest run tests/smoke/config.test.ts`

Expected: FAIL resolving `astro.config.mjs`.

- [ ] **Step 3: Add the Astro 7 project configuration and scripts**

```json
{
  "name": "soohyunii-blog",
  "type": "module",
  "private": true,
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev",
    "build:astro": "astro build",
    "build": "pnpm validate && astro build && pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit",
    "validate": "tsx scripts/validate-content.ts",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Install runtime dependencies with:

```powershell
pnpm add astro@^7.2.0 @astrojs/mdx @astrojs/sitemap fast-glob gray-matter yaml
pnpm add -D @astrojs/check @playwright/test @types/node pagefind tsx typescript vitest
```

Configure `astro.config.mjs` with `site: "https://soohyunii.github.io"`, `base: "/"`, `output: "static"`, MDX, and sitemap. Use `tsconfig.json` extending `astro/tsconfigs/strict`.

- [ ] **Step 4: Define neutral design tokens and a minimal home route**

`src/styles/tokens.css` must define light and dark values for `--color-background`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-accent`, `--color-focus`, `--font-interface`, `--font-reading`, `--font-code`, `--sidebar-width`, and `--reading-width`. `src/pages/index.astro` imports `global.css` and renders `Soohyun's Blog` so the foundation has a visible route.

- [ ] **Step 5: Run foundation verification**

Run:

```powershell
pnpm exec vitest run tests/smoke/config.test.ts
pnpm check
pnpm build:astro
```

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 6: Commit the foundation**

```powershell
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json src/env.d.ts src/pages/index.astro src/styles .gitignore tests/smoke/config.test.ts
git commit -m "build: scaffold Astro blog"
```

---

### Task 2: Category schema, normalization, and YAML source

**Files:**
- Create: `src/data/categories.yml`
- Create: `src/lib/categories/schema.ts`
- Create: `src/lib/categories/normalize.ts`
- Create: `src/lib/categories/load.ts`
- Create: `tests/categories/normalize.test.ts`

**Interfaces:**
- Produces: `CategoryInput`, `CategoryNode`, and `CategoryIndex` types.
- Produces: `normalizeCategories(input: unknown): CategoryIndex`.
- Produces: `loadCategoryIndex(): CategoryIndex`.

- [ ] **Step 1: Write normalization tests for recursion, IDs, and slugs**

```ts
// tests/categories/normalize.test.ts
import { describe, expect, it } from "vitest";
import { normalizeCategories } from "../../src/lib/categories/normalize";

const valid = {
  categories: [{
    id: "ai", name: "AI", slug: "ai", children: [
      { id: "masters-degree", name: "Master's Degree", slug: "masters-degree",
        children: [{ id: "data-science", name: "Data Science", slug: "data-science" }] }
    ]
  }]
};

describe("normalizeCategories", () => {
  it("indexes arbitrary-depth nodes and their full paths", () => {
    const index = normalizeCategories(valid);
    expect(index.byId.get("data-science")?.path).toBe("ai/masters-degree/data-science");
  });

  it("rejects duplicate IDs", () => {
    expect(() => normalizeCategories({ categories: [
      { id: "same", name: "A", slug: "a" },
      { id: "same", name: "B", slug: "b" }
    ] })).toThrow(/Duplicate category id: same/);
  });

  it("rejects duplicate sibling slugs", () => {
    expect(() => normalizeCategories({ categories: [{
      id: "root", name: "Root", slug: "root", children: [
        { id: "a", name: "A", slug: "child" },
        { id: "b", name: "B", slug: "child" }
      ]
    }] })).toThrow(/Duplicate sibling slug: child/);
  });
});
```

- [ ] **Step 2: Run tests and verify missing implementation failure**

Run: `pnpm exec vitest run tests/categories/normalize.test.ts`

Expected: FAIL resolving `normalizeCategories`.

- [ ] **Step 3: Implement typed normalization**

Define:

```ts
export interface CategoryInput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  projectUrl?: string;
  children?: CategoryInput[];
}

export interface CategoryNode extends Omit<CategoryInput, "children"> {
  parentId: string | null;
  childIds: string[];
  depth: number;
  path: string;
}

export interface CategoryIndex {
  roots: string[];
  byId: Map<string, CategoryNode>;
  byPath: Map<string, CategoryNode>;
}
```

`normalizeCategories()` must validate non-empty fields, lowercase URL-safe slugs, global unique IDs, unique sibling slugs, and reserved root slugs `posts`, `tags`, `archive`, `about`, and `search`. Preserve YAML array order in `roots` and `childIds`.

- [ ] **Step 4: Add the approved YAML tree and loader**

Use the complete approved hierarchy from the spec. `load.ts` reads `src/data/categories.yml` with `readFileSync`, parses it with `yaml.parse`, caches the normalized result, and exports `loadCategoryIndex()`.

- [ ] **Step 5: Run category tests and type checks**

Run:

```powershell
pnpm exec vitest run tests/categories/normalize.test.ts
pnpm check
```

Expected: PASS and exit 0.

- [ ] **Step 6: Commit category configuration**

```powershell
git add src/data/categories.yml src/lib/categories tests/categories/normalize.test.ts
git commit -m "feat: add hierarchical category model"
```

---

### Task 3: Category queries and content validation

**Files:**
- Create: `src/lib/categories/queries.ts`
- Create: `scripts/validate-content.ts`
- Create: `tests/categories/queries.test.ts`
- Create: `tests/fixtures/categories.ts`

**Interfaces:**
- Consumes: `CategoryIndex` from Task 2.
- Produces: `getAncestors(index, id): CategoryNode[]`.
- Produces: `getDescendantIds(index, id): Set<string>`.
- Produces: `countPostsByCategory(index, categoryIds): Map<string, number>`.
- Produces: `validatePostCategories(index, posts): string[]`.

- [ ] **Step 1: Write failing query tests**

```ts
it("returns ancestors from root to parent", () => {
  expect(getAncestors(index, "data-science").map(node => node.id))
    .toEqual(["ai", "masters-degree"]);
});

it("counts posts into every ancestor subtree", () => {
  const counts = countPostsByCategory(index, ["data-science", "competitions"]);
  expect(counts.get("ai")).toBe(2);
  expect(counts.get("masters-degree")).toBe(2);
  expect(counts.get("data-science")).toBe(1);
});

it("reports unknown category references", () => {
  expect(validatePostCategories(index, [{ id: "bad-post", category: "missing" }]))
    .toEqual(["Post bad-post references unknown category: missing"]);
});
```

- [ ] **Step 2: Run and verify failures for missing query functions**

Run: `pnpm exec vitest run tests/categories/queries.test.ts`

Expected: FAIL resolving exports from `queries.ts`.

- [ ] **Step 3: Implement iterative tree queries**

Use parent links for ancestors and an explicit stack for descendants so behavior is independent of nesting depth. `countPostsByCategory()` increments the direct category and each ancestor exactly once per post.

- [ ] **Step 4: Implement the validation CLI**

`scripts/validate-content.ts` loads the category index, finds `src/content/posts/**/*.{md,mdx}` with `fast-glob`, and parses each frontmatter block with `gray-matter`. It passes `{ id: relativePath, category: data.category }` records to `validatePostCategories()`, also rejects duplicate explicit `slug` values, prints each error on its own line, and sets `process.exitCode = 1` when any error exists. It prints `Content validation passed` on success. Astro's schema validation remains responsible for field types and required fields during `astro check` and `astro build`.

- [ ] **Step 5: Run focused and full tests**

Run:

```powershell
pnpm exec vitest run tests/categories
pnpm validate
```

Expected: PASS and `Content validation passed`.

- [ ] **Step 6: Commit category queries**

```powershell
git add src/lib/categories/queries.ts scripts/validate-content.ts tests/categories tests/fixtures
git commit -m "feat: validate category relationships"
```

---

### Task 4: Post collection and existing-content migration

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content/posts.ts`
- Create: `src/content/posts/2019-02-22-my-story.md`
- Create: `tests/content/posts.test.ts`

**Interfaces:**
- Produces: Astro collection `posts`.
- Produces: `getPublishedPosts(): Promise<CollectionEntry<"posts">[]>` sorted newest first.
- Produces: `getPostsForCategory(categoryId, includeDescendants): Promise<CollectionEntry<"posts">[]>`.

- [ ] **Step 1: Write failing post-query tests**

Mock three entries and assert that `getPublishedPosts()` excludes drafts and sorts by `publishedAt` descending. Assert that `getPostsForCategory("masters-degree", true)` includes entries in `data-science` and `competitions`.

```ts
expect(result.map(post => post.id)).toEqual(["newest", "older"]);
expect(categoryPosts.map(post => post.data.category)).toEqual(["data-science", "competitions"]);
```

- [ ] **Step 2: Run the test and verify missing collection/query failures**

Run: `pnpm exec vitest run tests/content/posts.test.ts`

Expected: FAIL resolving `src/lib/content/posts.ts`.

- [ ] **Step 3: Define the Astro 7 collection schema**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
    slug: z.string().optional()
  })
});

export const collections = { posts };
```

- [ ] **Step 4: Implement post queries and migrate the single legacy post**

Convert the `.EXTENSION` post into valid UTF-8 Markdown. Preserve its Korean title and body, set `category: etc`, add a concise Korean description, use `publishedAt: 2019-02-22`, and retain `tags: [자기계발]`. Remove no Jekyll file yet.

- [ ] **Step 5: Verify content**

Run:

```powershell
pnpm exec vitest run tests/content/posts.test.ts
pnpm validate
pnpm build:astro
```

Expected: PASS; Astro reports one generated post entry.

- [ ] **Step 6: Commit content architecture**

```powershell
git add src/content.config.ts src/content src/lib/content tests/content
git commit -m "feat: add typed blog content"
```

---

### Task 5: Responsive application shell and category navigation

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/navigation/CategoryTree.astro`
- Create: `src/components/navigation/SearchTrigger.astro`
- Create: `src/components/navigation/Sidebar.astro`
- Create: `src/components/navigation/MobileDrawer.astro`
- Create: `src/components/navigation/Breadcrumbs.astro`
- Modify: `src/styles/global.css`
- Create: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `CategoryIndex`, category counts, and active category ID.
- Produces: `BaseLayout` slots `default` and `rightRail`.
- Produces: accessible category links plus separate disclosure buttons.

- [ ] **Step 1: Write failing browser assertions for the approved mockup behavior**

```ts
test("category navigation is persistent and independently expandable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Categories" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search posts" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse Master's Degree" }).click();
  await expect(page.getByRole("link", { name: /Data Science/ })).toBeHidden();
  await expect(page.getByRole("link", { name: /Master's Degree/ })).toBeVisible();
});
```

- [ ] **Step 2: Run the E2E test and verify missing navigation failure**

Run: `pnpm exec playwright test tests/e2e/navigation.spec.ts`

Expected: FAIL because the navigation elements do not exist.

- [ ] **Step 3: Implement the desktop shell and recursive tree**

Render each category as a link and, when children exist, a separate `button` with `aria-expanded` and an explicit label. Add subtree counts. Use `data-category-id` and `data-category-path` only as stable browser hooks. Expand the active node's ancestors server-side.

- [ ] **Step 4: Add browser state and mobile drawer behavior**

Use a small inline module script that stores expanded category IDs under `blog:expanded-categories`. Do not store content or search history. Under the tablet breakpoint, hide the fixed sidebar and expose a labeled menu button that opens a dialog-like drawer, traps no focus manually, and closes on Escape.

- [ ] **Step 5: Verify navigation at desktop and mobile widths**

Run: `pnpm exec playwright test tests/e2e/navigation.spec.ts --project=chromium`

Expected: PASS at configured 1280×800 and 390×844 projects.

- [ ] **Step 6: Commit the application shell**

```powershell
git add src/layouts src/components/navigation src/styles/global.css tests/e2e/navigation.spec.ts playwright.config.ts
git commit -m "feat: add category-first navigation"
```

---

### Task 6: Post UI, category pages, and core routes

**Files:**
- Create: `src/components/post/PostCard.astro`
- Create: `src/components/post/PostMeta.astro`
- Create: `src/components/post/TagList.astro`
- Create: `src/components/post/TableOfContents.astro`
- Create: `src/layouts/PostLayout.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/category/[...path].astro`
- Create: `src/pages/posts/[slug].astro`
- Create: `src/pages/archive.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/styles/prose.css`
- Create: `tests/routes/routes.test.ts`
- Create: `tests/e2e/blog.spec.ts`

**Interfaces:**
- Consumes: category paths and published post queries.
- Produces: static route parameters for every category, post, and tag.
- Produces: compact tag display with `limit={3}` on cards and full display on posts.

- [ ] **Step 1: Write route-generation unit tests**

Assert the approved category tree generates `ai`, `ai/masters-degree`, `ai/masters-degree/data-science`, and every remaining normalized path. Assert every published post generates `/posts/<id>/` and drafts generate no route.

- [ ] **Step 2: Run route tests and verify missing route-builder failure**

Run: `pnpm exec vitest run tests/routes/routes.test.ts`

Expected: FAIL because dynamic route functions have not been implemented.

- [ ] **Step 3: Implement shared post components and layouts**

`PostCard` displays title, description, publication date, reading metadata, and at most three compact tags. `PostLayout` renders breadcrumbs, prose, the full tag list after the article, and `rightRail` table of contents only when headings exist. Add Pagefind metadata to post pages: `data-pagefind-body` on the article, `data-pagefind-meta="category:<category name>"` for the category, and one `data-pagefind-meta="tag:<tag>"` element per tag so the production index covers every required field.

- [ ] **Step 4: Implement static routes**

Category `getStaticPaths()` uses `index.byPath`. Parent pages call `getPostsForCategory(id, true)`. Post `getStaticPaths()` filters drafts. Tag routes normalize tags case-insensitively for grouping while preserving display text. Archive sorts posts by year then date.

- [ ] **Step 5: Run unit, E2E, accessibility-oriented, and build checks**

Run:

```powershell
pnpm exec vitest run tests/routes
pnpm build:astro
pnpm exec playwright test tests/e2e/blog.spec.ts
```

Expected: PASS; generated HTML includes home, category, post, archive, about, and tag routes.

- [ ] **Step 6: Commit core pages**

```powershell
git add src/components/post src/layouts/PostLayout.astro src/pages src/styles/prose.css tests/routes tests/e2e/blog.spec.ts
git commit -m "feat: add blog pages and post layouts"
```

---

### Task 7: Pagefind search

**Files:**
- Create: `src/pages/search.astro`
- Modify: `src/components/navigation/SearchTrigger.astro`
- Modify: `package.json`
- Create: `tests/e2e/search.spec.ts`

**Interfaces:**
- Consumes: Pagefind output at `/pagefind/pagefind.js` after `pnpm build`.
- Produces: sidebar search box and `/search/?q=<query>` result view.

- [ ] **Step 1: Write the failing production-search E2E test**

```ts
test("search returns indexed post content", async ({ page }) => {
  await page.goto("/search/");
  await page.getByRole("searchbox", { name: "Search posts" }).fill("데이터");
  await expect(page.getByRole("link", { name: /지금까지 한 일들/ })).toBeVisible();
});
```

- [ ] **Step 2: Build and run the test to verify search is absent**

Run:

```powershell
pnpm build
pnpm exec playwright test tests/e2e/search.spec.ts
```

Expected: FAIL because the search page does not initialize Pagefind.

- [ ] **Step 3: Implement progressively enhanced search**

The search page reads `q` from `URLSearchParams`, dynamically imports `/pagefind/pagefind.js`, runs `pagefind.search(query)`, loads result data, and renders title, excerpt, category, and compact tags. Provide an `aria-live="polite"` result count. If import fails during `astro dev`, display `Search is available in production preview after pnpm build.` without breaking navigation.

- [ ] **Step 4: Connect the sidebar search control**

Submitting the sidebar form navigates to `/search/?q=<encoded value>`. The search input is visible on desktop and inside the mobile drawer.

- [ ] **Step 5: Rebuild and verify indexed search**

Run:

```powershell
pnpm build
pnpm exec playwright test tests/e2e/search.spec.ts
```

Expected: Pagefind reports at least one indexed page and the test passes.

- [ ] **Step 6: Commit search**

```powershell
git add src/pages/search.astro src/components/navigation/SearchTrigger.astro package.json pnpm-lock.yaml tests/e2e/search.spec.ts
git commit -m "feat: add static full-text search"
```

---

### Task 8: Remove Jekyll runtime and add Astro deployment

**Files:**
- Modify: `.github/workflows/pages-deploy.yml`
- Modify: `README.md`
- Delete: `Gemfile`
- Delete: `_config.yml`
- Delete: `_plugins/posts-lastmod-hook.rb`
- Delete: `_tabs/about.md`
- Delete: `_tabs/archives.md`
- Delete: `_tabs/categories.md`
- Delete: `_tabs/tags.md`
- Delete: `_data/contact.yml`
- Delete: `_data/share.yml`
- Delete: `index.html`
- Delete: `.gitmodules`
- Delete: `assets/lib` gitlink
- Delete: `_posts/.placeholder`
- Delete: legacy `.EXTENSION` post after migrated-content comparison

**Interfaces:**
- Consumes: successful `pnpm build` output from prior tasks.
- Produces: GitHub Pages artifact built with Node 24 and pnpm.

- [ ] **Step 1: Capture the legacy post body before deletion and compare it to the migrated Markdown**

Run a UTF-8 text comparison that strips frontmatter from both files and normalizes line endings. Expected: the migrated file contains every non-empty legacy body paragraph. Do not delete the legacy file if any paragraph is missing.

- [ ] **Step 2: Replace the Pages workflow**

Use `actions/checkout@v6`, `withastro/action@v6` configured with Node 24 and the detected pnpm lockfile, followed by `actions/deploy-pages@v5`. Keep `contents: read`, `pages: write`, and `id-token: write` permissions and the `pages` concurrency group.

- [ ] **Step 3: Replace the starter README**

Document prerequisites, `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`, adding posts, editing `src/data/categories.yml`, category stable-ID rules, and GitHub Pages deployment.

- [ ] **Step 4: Remove Jekyll-only files after fresh Astro verification**

Run `pnpm build` immediately before deletion. Remove only the exact files listed above; preserve favicon image files by moving needed assets into `public/` before deleting any obsolete directory.

- [ ] **Step 5: Run the complete local gate with Jekyll absent**

Run:

```powershell
pnpm test
pnpm check
pnpm build
pnpm exec playwright test
git diff --check
```

Expected: every command exits 0; `Gemfile` and `_config.yml` are absent; `dist/index.html`, `dist/search/index.html`, and `dist/pagefind/pagefind.js` exist.

- [ ] **Step 6: Commit the platform migration**

```powershell
git add -A
git commit -m "build: replace Jekyll with Astro"
```

---

### Task 9: Final responsive, route, and content verification

**Files:**
- Modify only files implicated by a failing verification.
- Create: `docs/astro-blog-maintenance.md`

**Interfaces:**
- Consumes: complete Astro site.
- Produces: verified migration and maintenance guide for category operations.

- [ ] **Step 1: Add a category-maintenance runbook**

Document exact YAML examples for creating a root category, adding a child, renaming a category while retaining its ID, moving a category, and deleting an unused category. Include the commands `pnpm validate`, `pnpm test`, and `pnpm build` after every category edit.

- [ ] **Step 2: Verify all acceptance routes in production preview**

Start `pnpm preview` after `pnpm build` and verify HTTP 200 for `/`, `/category/ai/`, `/category/ai/masters-degree/data-science/`, `/posts/2019-02-22-my-story/`, `/archive/`, `/tags/`, `/about/`, and `/search/`. Verify a nonexistent category returns 404.

- [ ] **Step 3: Verify responsive layouts**

Run Playwright at 390×844, 768×1024, 1280×800, and 1536×960. Assert no horizontal page overflow; desktop sidebar is visible at wide widths; mobile menu is visible at 390px; right table of contents is hidden below the desktop-wide breakpoint.

- [ ] **Step 4: Run the final fresh verification gate**

Run:

```powershell
pnpm test
pnpm check
pnpm build
pnpm exec playwright test
git status --short
```

Expected: all test/build commands exit 0 and only the maintenance guide or intentional verification fixes are uncommitted.

- [ ] **Step 5: Commit final documentation and verification fixes**

```powershell
git add docs/astro-blog-maintenance.md
git add -u
git commit -m "docs: add Astro blog maintenance guide"
```

- [ ] **Step 6: Record handoff evidence**

Report the exact final command outputs, generated route count, indexed Pagefind page count, test counts, local preview URL, commit list, and any intentionally deferred visual decisions. Do not push or deploy without a separate user request.
