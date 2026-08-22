import { describe, expect, it } from "vitest";
import { normalizeCategories } from "../../src/lib/categories/normalize";
import {
  countPostsByCategory,
  getAncestors,
  getDescendantIds,
  validatePostCategories,
} from "../../src/lib/categories/queries";

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

describe("category queries", () => {
  it("returns ancestors from root to parent", () => {
    expect(getAncestors(index, "data-science").map((node) => node.id)).toEqual([
      "ai",
      "masters-degree",
    ]);
  });

  it("returns a category and all descendants", () => {
    expect([...getDescendantIds(index, "masters-degree")]).toEqual([
      "masters-degree",
      "data-science",
      "competitions",
    ]);
  });

  it("counts posts into every ancestor subtree", () => {
    const counts = countPostsByCategory(index, ["data-science", "competitions"]);

    expect(counts.get("ai")).toBe(2);
    expect(counts.get("masters-degree")).toBe(2);
    expect(counts.get("data-science")).toBe(1);
  });

  it("reports unknown category references", () => {
    expect(
      validatePostCategories(index, [{ id: "bad-post", category: "missing" }]),
    ).toEqual(["Post bad-post references unknown category: missing"]);
  });
});
