# Astro Blog Redesign Design

## Objective

Replace the current Jekyll Chirpy site with a custom Astro blog focused on frequently changing, deeply nested categories. Preserve Markdown-based authoring and GitHub Pages deployment while making navigation, search, and future visual customization straightforward.

## Scope

This redesign includes:

- Astro and TypeScript project architecture
- Markdown and MDX content collections
- A manually managed hierarchical category tree
- A fixed desktop category sidebar and mobile drawer
- Static full-text search
- Category, archive, tag, about, home, and post pages
- Existing-post migration and URL compatibility where practical
- GitHub Actions deployment to `soohyunii.github.io`
- Automated content validation and responsive verification

Final brand colors, font families, and decorative styling are intentionally deferred. Their values will be configurable through design tokens without changing components.

## Information Architecture

### Category tree

Categories live in `src/data/categories.yml`. The tree supports arbitrary depth and uses array order as display order.

```yaml
categories:
  - id: ai
    name: AI
    slug: ai
    children:
      - id: masters-degree
        name: Master's Degree
        slug: masters-degree
        children:
          - id: data-science
            name: Data Science
            slug: data-science
          - id: competitions
            name: Competitions
            slug: competitions
          - id: capstone-design
            name: Capstone Design
            slug: capstone-design
      - id: projects
        name: Projects
        slug: projects
        children:
          - id: dancebridge
            name: DanceBridge
            slug: dancebridge
            description: Posts associated with the DanceBridge project
      - id: self-study
        name: Self-Study
        slug: self-study
        children:
          - id: certifications
            name: Certifications
            slug: certifications
          - id: courses-and-books
            name: Courses & Books
            slug: courses-and-books
          - id: etc
            name: etc
            slug: etc
      - id: resources
        name: Resources
        slug: resources
```

Each category has a stable `id`, display `name`, URL `slug`, optional `description`, and optional recursive `children`. Renaming or moving a category does not require editing its posts because posts reference the stable ID.

Private categories are outside the scope of this version.

### Post model

Every post belongs to exactly one primary category. Tags provide secondary, non-hierarchical associations.

```yaml
---
title: Exploratory Data Analysis with Python
description: 데이터 탐색 과정 정리
publishedAt: 2026-08-22
category: data-science
tags:
  - Python
  - EDA
draft: false
---
```

Required fields are `title`, `description`, `publishedAt`, `category`, and `draft`. Tags are optional. Additional fields such as `updatedAt`, `cover`, and `canonicalUrl` may be supported without becoming required.

### Category behavior

- Clicking a category name opens its category page.
- A separate disclosure control expands or collapses child categories.
- A parent category page includes posts assigned to itself and every descendant.
- A leaf category page includes posts assigned directly to that category.
- The active category and its ancestors are expanded and highlighted.
- Each category displays the number of posts in its full subtree.
- Empty categories are allowed.
- The reader's expanded state is remembered locally in the browser.

## Layout

### Desktop

The page uses three regions:

1. A fixed left sidebar containing the site identity, search, category tree, and low-priority utility navigation.
2. A flexible center column containing breadcrumbs, category or page heading, post lists, and post content.
3. An optional right table of contents visible only on sufficiently wide post pages.

The sidebar prioritizes categories. About, Archive, and Tags remain available near its bottom but receive less visual emphasis.

### Responsive behavior

- Wide desktop: persistent left sidebar, main content, and right table of contents.
- Narrow desktop or tablet: collapsible compact sidebar and no right table of contents.
- Mobile: the sidebar becomes a menu-triggered drawer; the main content occupies the full width.

### Tags

Tags remain visible without competing with navigation or post titles.

- Post lists show up to three compact tags after secondary metadata.
- Post pages show the complete tag list near the end of the article.
- A dedicated Tags page remains accessible from utility navigation.
- Tags do not appear as a large cloud or primary sidebar section.

## Pages and Routes

- `/`: recent posts and optional pinned introduction
- `/category/<nested-path>/`: category page
- `/posts/<slug>/`: post page, preserving the existing general permalink shape
- `/archive/`: chronological archive
- `/tags/`: tag index
- `/tags/<slug>/`: posts associated with a tag
- `/about/`: author profile
- `/search/`: full search interface and shareable search entry point

Old post paths will be inventoried during migration. Compatible paths will be retained; changed paths will receive static redirects where GitHub Pages permits them.

## Search

Pagefind builds a static index after Astro produces the site. Search covers post title, description, body, category labels, and tags. Drafts and non-production content are absent from both output and index.

The search control remains visible near the top of the sidebar. It opens a focused search interface usable by keyboard and on mobile. Search failure must leave navigation and content usable.

## Architecture

### Primary modules

- `src/data/categories.yml`: human-editable source of category truth
- `src/content/posts/`: Markdown and MDX posts
- `src/lib/categories/`: parsing, indexing, ancestry, descendants, paths, and post counts
- `src/lib/content/`: post querying and sorting
- `src/components/navigation/`: sidebar, category tree, breadcrumbs, and mobile drawer
- `src/components/post/`: post cards, metadata, tags, and table of contents
- `src/layouts/`: shared page and post shells
- `src/pages/`: static and dynamic route generation
- `src/styles/`: design tokens, global rules, typography, and component styles

Category parsing produces an immutable normalized index keyed by category ID. Navigation, routes, breadcrumbs, and counts consume the same index so they cannot disagree about the tree.

### Design tokens

Color and typography values are deferred, but their interfaces are established from the beginning.

- Semantic color tokens: background, surface, text, muted text, border, accent, active navigation, code block, and focus ring
- Typography tokens: interface font, reading font, code font, size scale, line height, and weight
- Layout tokens: sidebar width, reading width, spacing scale, and breakpoints
- Shape tokens: radius and shadow levels kept minimal

Light and dark themes will override semantic tokens rather than component rules. Choosing fonts or colors later will require editing token values instead of rewriting layouts.

## Validation and Error Handling

The build fails with actionable messages for:

- Duplicate category IDs
- Duplicate sibling slugs
- Missing or malformed required category fields
- A post referencing an unknown category ID
- Duplicate post slugs
- Invalid publication dates
- Category routes that collide with reserved routes

Deleting a category still referenced by posts is rejected. Renaming or moving a category is valid because references use stable IDs. Empty categories remain valid and render an empty state.

YAML cannot directly form an object cycle, so explicit cycle detection is unnecessary unless future cross-reference fields are introduced.

## Migration

1. Preserve the Jekyll source in Git history.
2. Inventory existing routes and content.
3. Create the Astro project and category configuration.
4. Convert valid posts to the new content schema.
5. Correct the existing `.EXTENSION` post filename during migration.
6. Build and verify old and new routes.
7. Replace the GitHub Pages workflow only after the Astro production build passes.

The current repository contains one post candidate, so migration risk is low. Jekyll theme assets, Ruby plugins, Gemfile, and Chirpy configuration are removed only after the Astro replacement is verified.

## Deployment

GitHub Actions will install the locked Node dependencies, validate content, build Astro, create the Pagefind index, run tests and link checks, and upload the static artifact to GitHub Pages. The site remains a user site at `https://soohyunii.github.io` with an empty base path.

The package manager lockfile is committed to keep local and CI builds reproducible.

## Testing and Acceptance Criteria

Automated checks cover:

- Category YAML schema and unique IDs
- Arbitrary-depth ancestry and descendant traversal
- Category post counts
- Parent-category aggregation
- Unknown post-category references
- Route generation and reserved-route collisions
- Draft exclusion
- Search index generation
- Production build
- Internal-link validation

Browser-level verification covers:

- Persistent desktop sidebar
- Category disclosure and active ancestry
- Search by keyboard and pointer
- Mobile drawer navigation
- Post list and post page rendering
- Compact tag display
- Responsive behavior at representative mobile, tablet, and desktop widths
- Light and dark token application once visual values are selected

The redesign is accepted when the production build succeeds, the deployed route structure is valid, category edits require only the YAML file, every post resolves to one category, search returns indexed posts, and navigation remains usable across supported widths.

## Deferred Decisions

The following are intentionally deferred without blocking implementation:

- Final color palette
- Final interface and reading fonts
- Logo and avatar treatment
- Decorative motion and illustration
- Final light and dark theme values
- DanceBridge repository integration beyond a configurable external link

These decisions will be applied through design tokens and optional category metadata after the functional layout is working.
