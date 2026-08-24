import { beforeEach, describe, expect, it } from "vitest";
import { signToken, verifyToken, type JwtPayload } from "../src/utils/jwt.js";

const payload: JwtPayload = { userId: "64f0a1b2c3d4e5f6a7b8c9d0", role: "employee" };

describe("JWT utils", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  describe("signToken", () => {
    it("should sign a payload and return a string token", () => {
      const token = signToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should embed the payload claims in the token", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it("should throw when JWT_SECRET is not set", () => {
      delete process.env.JWT_SECRET;

      expect(() => signToken(payload)).toThrowError("JWT_SECRET is not set");
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a token signed with the same secret", () => {
      const decoded = verifyToken(signToken(payload));

      expect(decoded).toMatchObject(payload);
    });

    it("should throw for a token signed with a different secret", () => {
      const token = signToken(payload);
      process.env.JWT_SECRET = "another-secret";

      expect(() => verifyToken(token)).toThrowError();
    });

    it("should throw for malformed tokens", () => {
      expect(() => verifyToken("not-a-real-token")).toThrowError();
    });
  });
});
