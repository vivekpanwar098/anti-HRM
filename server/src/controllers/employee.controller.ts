
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";
import { Attendance } from "../models/Attendance.js";



// GET /api/employee/me
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.auth?.userId).lean();
  if (!user || !user.employee) {
    res.status(404).json({ message: "Employee profile not found" });
    return;
  }

  const employee = await Employee.findById(user.employee).lean();
  if (!employee) {
    res.status(404).json({ message: "Employee profile not found" });
    return;
  }

  res.status(200).json({ data: employee });
};

// GET /api/employee/me/attendance
export const getMyAttendance = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.auth?.userId).lean();
  if (!user || !user.employee) {
    res.status(404).json({ message: "Employee profile not found" });
    return;
  }

  const { from, to } = req.query;
  const filter: Record<string, unknown> = { employee: user.employee };
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);
    filter.date = dateFilter;
  }

  const records = await Attendance.find(filter).sort({ date: -1 }).lean();
  res.status(200).json({ data: records });
};