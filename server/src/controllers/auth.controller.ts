import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const signin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isMatch: boolean = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token: string = signToken({ userId: user._id.toString(), role: user.role });

 res.status(200).json({
  token,
  user: {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    employee: user.employee ? user.employee.toString() : null,
  },
});
};