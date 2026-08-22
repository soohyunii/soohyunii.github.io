import { describe, expect, it } from "vitest";
import { normalizeCategories } from "../../src/lib/categories/normalize";
import {
  filterAndSortPublishedPosts,
  filterPostsForCategory,
  type BlogPost,
} from "../../src/lib/content/posts";

const index = normalizeCategories({
  categories: [
    {
      id: "ai",
      name: "AI",
      slug: "ai",
      children: [
        {
          id: "masters-degree",
          name: "Master's Degree",
          slug: "masters-degree",
          children: [
            { id: "data-science", name: "Data Science", slug: "data-science" },
            { id: "competitions", name: "Competitions", slug: "competitions" },
          ],
        },
      ],
    },
  ],
});

const posts: BlogPost[] = [
  {
    id: "older",
    data: {
      title: "Older",
      description: "Older post",
      publishedAt: new Date("2025-01-01"),
      category: "data-science",
      tags: [],
      draft: false,
    },
  },
  {
    id: "newest",
    data: {
      title: "Newest",
      description: "Newest post",
      publishedAt: new Date("2026-01-01"),
      category: "competitions",
      tags: [],
      draft: false,
    },
  },
  {
    id: "draft",
    data: {
      title: "Draft",
      description: "Draft post",
      publishedAt: new Date("2027-01-01"),
      category: "data-science",
      tags: [],
      draft: true,
    },
  },
];

describe("post queries", () => {
  it("excludes drafts and sorts newest first", () => {
    expect(filterAndSortPublishedPosts(posts).map((post) => post.id)).toEqual([
      "newest",
      "older",
    ]);
  });

  it("includes descendant posts for a parent category", () => {
    expect(
      filterPostsForCategory(posts, index, "masters-degree", true).map(
        (post) => post.data.category,
      ),
    ).toEqual(["competitions", "data-science"]);
  });

  it("limits a leaf query to directly assigned posts", () => {
    expect(
      filterPostsForCategory(posts, index, "data-science", false).map(
        (post) => post.id,
      ),
    ).toEqual(["older"]);
  });
});
