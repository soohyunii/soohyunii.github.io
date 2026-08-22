import { describe, expect, it } from "vitest";
import config from "../../astro.config.mjs";

describe("Astro configuration", () => {
  it("targets the GitHub user site", () => {
    expect(config.site).toBe("https://soohyunii.github.io");
    expect(config.base).toBe("/");
    expect(config.output).toBe("static");
  });
});
