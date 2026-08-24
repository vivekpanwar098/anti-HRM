// src/controllers/admin.controller.ts
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";
import { Attendance } from "../models/Attendance.js";

// POST /api/admin/employees
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, department, designation, joinDate, baseSalary, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: "A user with this email already exists" });
    return;
  }

  const employee = await Employee.create({
    name,
    email,
    phone,
    department,
    designation,
    joinDate,
    baseSalary,
  });

  const hashedPassword: string = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "employee",
    employee: employee._id,
  });

  res.status(201).json({
    employee: {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      joinDate: employee.joinDate,
      baseSalary: employee.baseSalary,
      isActive: employee.isActive,
    },
    user: { id: user._id.toString(), email: user.email, role: user.role },
  });
};

// GET /api/admin/employees
export const listEmployees = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const { department, isActive } = req.query;

  const filter: Record<string, unknown> = {};
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);

  res.status(200).json({
    data: employees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

// GET /api/admin/employees/:id
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findById(req.params.id).lean();
  if (!employee) {
    res.status(404).json({ message: "Employee not found" });
    return;
  }
  res.status(200).json({ data: employee });
};

// PATCH /api/admin/employees/:id
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, department, designation, baseSalary, isActive } = req.body;

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { name, phone, department, designation, baseSalary, isActive },
    { new: true, runValidators: true }
  );

  if (!employee) {
    res.status(404).json({ message: "Employee not found" });
    return;
  }

  res.status(200).json({ data: employee });
};

// DELETE /api/admin/employees/:id  (soft delete — deactivate, don't hard-remove)
export const deactivateEmployee = async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!employee) {
    res.status(404).json({ message: "Employee not found" });
    return;
  }

  res.status(200).json({ message: "Employee deactivated", data: employee });
};

// POST /api/admin/attendance
export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404).json({ message: "Employee not found" });
    return;
  }

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  try {
    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: normalizedDate },
      { status, checkIn, checkOut, remarks, markedBy: req.auth?.userId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ data: attendance });
  } catch (err) {
    res.status(400).json({ message: "Failed to mark attendance" });
  }
};

// GET /api/admin/attendance/:employeeId
export const getEmployeeAttendance = async (req: Request, res: Response): Promise<void> => {
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const filter: Record<string, unknown> = { employee: employeeId };
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);
    filter.date = dateFilter;
  }

  const records = await Attendance.find(filter).sort({ date: -1 }).lean();
  res.status(200).json({ data: records });
};