import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const themePath = resolve(process.cwd(), "themes/admin.css");
const theme = readFileSync(themePath, "utf8");

describe("admin theme", () => {
  it("defines the Admin React visual contract", () => {
    expect(theme).toContain("--plt-color-base-100: #ffffff");
    expect(theme).toContain("--plt-color-base-200: #f9fafb");
    expect(theme).toContain("--plt-color-base-300: #e5e7eb");
    expect(theme).toContain("--plt-color-primary: #2563eb");
    expect(theme).toContain("--plt-color-error: #dc2626");
    expect(theme).toContain("--plt-radius-field: 0.375rem");
    expect(theme).toContain("--plt-radius-box: 0.5rem");
    expect(theme).toContain("--plt-border-width: 1px");
    expect(theme).toContain("--plt-shadow-offset: 0px");
  });
});
