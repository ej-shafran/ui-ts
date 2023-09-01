import { describe, it, expect } from "vitest";
import { hello } from "../src";

describe("ui-ts", () => {
  it("works", () => {
    expect(hello).toBe("Hello");
  });
});
