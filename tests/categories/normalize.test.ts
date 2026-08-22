import { describe, expect, it } from "vitest";
import { normalizeCategories } from "../../src/lib/categories/normalize";

const valid = {
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
            {
              id: "data-science",
              name: "Data Science",
              slug: "data-science",
            },
          ],
        },
      ],
    },
  ],
};

describe("normalizeCategories", () => {
  it("indexes arbitrary-depth nodes and their full paths", () => {
    const index = normalizeCategories(valid);

    expect(index.byId.get("data-science")?.path).toBe(
      "ai/masters-degree/data-science",
    );
    expect(index.roots).toEqual(["ai"]);
  });

  it("rejects duplicate IDs", () => {
    expect(() =>
      normalizeCategories({
        categories: [
          { id: "same", name: "A", slug: "a" },
          { id: "same", name: "B", slug: "b" },
        ],
      }),
    ).toThrow("Duplicate category id: same");
  });

  it("rejects duplicate sibling slugs", () => {
    expect(() =>
      normalizeCategories({
        categories: [
          {
            id: "root",
            name: "Root",
            slug: "root",
            children: [
              { id: "a", name: "A", slug: "child" },
              { id: "b", name: "B", slug: "child" },
            ],
          },
        ],
      }),
    ).toThrow("Duplicate sibling slug: child");
  });

  it("rejects reserved root slugs", () => {
    expect(() =>
      normalizeCategories({
        categories: [{ id: "search-root", name: "Search", slug: "search" }],
      }),
    ).toThrow("Reserved root category slug: search");
  });
});
