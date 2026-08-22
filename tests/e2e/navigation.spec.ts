import { expect, test } from "@playwright/test";

test("desktop category navigation is persistent and independently expandable", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"));
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Categories" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search posts" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse Master's Degree" }).click();
  await expect(page.getByRole("link", { name: /Data Science/ })).toBeHidden();
  await expect(page.getByRole("link", { name: /Master's Degree/ })).toBeVisible();
});

test("mobile navigation opens the same category tree in a drawer", async ({ page },
  testInfo,
) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Master's Degree/ })).toBeVisible();
});
