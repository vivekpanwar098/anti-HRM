import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "admin" | "employee";
}

export const signToken = (payload: JwtPayload): string => {
  const secret: string | undefined = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  return jwt.sign(payload, secret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret: string | undefined = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  return jwt.verify(token, secret) as JwtPayload;
};