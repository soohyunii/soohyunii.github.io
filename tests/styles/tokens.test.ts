import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync("src/styles/tokens.css", "utf8");

describe("warm research library design tokens", () => {
  it("uses the approved cream, beige, terracotta, and brown palette", () => {
    expect(tokens).toContain("#faf5ea");
    expect(tokens).toContain("#e8d8c3");
    expect(tokens).toContain("#9a5035");
    expect(tokens).toContain("#30261f");
  });

  it("uses Pretendard for interface text and Noto Serif KR for reading", () => {
    expect(tokens).toContain('"Pretendard Variable"');
    expect(tokens).toContain('"Noto Serif KR"');
  });
});
