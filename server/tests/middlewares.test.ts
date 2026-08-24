import { beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import type { NextFunction, Request } from "express";
import { signToken } from "../src/utils/jwt.js";
import { authenticate, requireAdmin } from "../src/middlewares/auth.middleware.js";
import { validate } from "../src/middlewares/validate.js";
import { signinSchema } from "../src/validation/auth.validation.js";

process.env.JWT_SECRET = "test-secret";

type StubResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const makeRes = (): StubResponse => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return res;
};

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({ headers: {}, body: {}, ...overrides }) as Request;

const next = vi.fn<NextFunction>();

beforeEach(() => {
  next.mockClear();
});

describe("authenticate middleware", () => {
  it("should return 401 when the Authorization header is missing", () => {
    const res = makeRes();

    authenticate(makeReq(), res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing or invalid Authorization header",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when the header is not a Bearer token", () => {
    const res = makeRes();

    authenticate(makeReq({ headers: { authorization: "Basic abc" } }), res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for an invalid or expired token", () => {
    const res = makeRes();

    authenticate(
      makeReq({ headers: { authorization: "Bearer invalid.token.value" } }),
      res as never,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });

  it("should attach the decoded payload to req.auth and call next for a valid token", () => {
    const res = makeRes();
    const req = makeReq({
      headers: { authorization: `Bearer ${signToken({ userId: "u1", role: "admin" })}` },
    });

    authenticate(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.auth).toMatchObject({ userId: "u1", role: "admin" });
  });
});

describe("requireAdmin middleware", () => {
  it("should return 403 when the requester is not an admin", () => {
    const res = makeRes();
    const req = makeReq({ auth: { userId: "u1", role: "employee" } });

    requireAdmin(req, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when the requester is an admin", () => {
    const res = makeRes();
    const req = makeReq({ auth: { userId: "u1", role: "admin" } });

    requireAdmin(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("validate middleware", () => {
  const schema = signinSchema;

  it("should return 400 with flattened errors for invalid input", () => {
    const res = makeRes();

    validate(schema)(makeReq({ body: { email: "nope", password: "12345" } }), res as never, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid input", errors: expect.any(Object) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass parsed data downstream and call next for valid input", () => {
    const res = makeRes();
    const req = makeReq({ body: { email: "a@b.com", password: "secret123" } });

    validate(schema)(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ email: "a@b.com", password: "secret123" });
  });
});
