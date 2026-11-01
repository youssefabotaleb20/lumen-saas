import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safe-redirect";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/dashboard/billing")).toBe("/dashboard/billing");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", undefined, 42])(
    "rejects %s",
    (value) => {
      expect(safeNextPath(value)).toBe("/dashboard");
    },
  );
});
