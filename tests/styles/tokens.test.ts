import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync("src/styles/tokens.css", "utf8");

describe("calm research notes design tokens", () => {
  it("uses the approved ivory, gray-beige, brown, and ink palette", () => {
    expect(tokens).toContain("#f7f4ed");
    expect(tokens).toContain("#e9e3d7");
    expect(tokens).toContain("#79523a");
    expect(tokens).toContain("#26231f");
  });

  it("uses Pretendard for interface text and Noto Serif KR for reading", () => {
    expect(tokens).toContain('"Pretendard Variable"');
    expect(tokens).toContain('"Noto Serif KR"');
  });
});
