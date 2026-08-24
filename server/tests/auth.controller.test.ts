import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";

vi.mock("../src/models/User.js", () => ({
  User: { findOne: vi.fn() },
}));

const { signin } = await import("../src/controllers/auth.controller.js");
const { User } = await import("../src/models/User.js");

const findOneMock = User.findOne as unknown as ReturnType<typeof vi.fn>;

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

const makeReq = (body: Record<string, unknown>): Request => ({ body }) as Request;

describe("auth controller — signin", () => {
  beforeEach(() => {
    findOneMock.mockReset();
  });

  it("should return 401 when no user matches the email", async () => {
    findOneMock.mockResolvedValue(null);
    const res = makeRes();

    await signin(makeReq({ email: "ghost@antibikli.com", password: "secret123" }), res as never);

    expect(findOneMock).toHaveBeenCalledWith({ email: "ghost@antibikli.com" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
  });

  it("should return 401 when the password does not match", async () => {
    findOneMock.mockResolvedValue({
      _id: { toString: () => "u1" },
      email: "emp@antibikli.com",
      role: "employee",
      employee: { toString: () => "e1" },
      password: await bcrypt.hash("secret123", 8),
    });
    const res = makeRes();

    await signin(makeReq({ email: "emp@antibikli.com", password: "wrong-password" }), res as never);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
  });

  it("should return a token and the user payload on success", async () => {
    findOneMock.mockResolvedValue({
      _id: { toString: () => "u1" },
      email: "admin@antibikli.com",
      role: "admin",
      employee: null,
      password: await bcrypt.hash("secret123", 8),
    });
    const res = makeRes();

    await signin(makeReq({ email: "admin@antibikli.com", password: "secret123" }), res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0] as {
      token: string;
      user: { id: string; email: string; role: string; employee: string | null };
    };
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({
      id: "u1",
      email: "admin@antibikli.com",
      role: "admin",
      employee: null,
    });
  });
});
