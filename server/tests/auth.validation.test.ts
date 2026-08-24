import { describe, expect, it } from "vitest";
import { signinSchema } from "../src/validation/auth.validation.js";

describe("signinSchema", () => {
  it("should accept a valid email and password", () => {
    const result = signinSchema.safeParse({
      email: "employee@antibikli.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const result = signinSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a password shorter than 6 characters", () => {
    const result = signinSchema.safeParse({
      email: "employee@antibikli.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing fields", () => {
    const result = signinSchema.safeParse({ email: "employee@antibikli.com" });

    expect(result.success).toBe(false);
  });
});
