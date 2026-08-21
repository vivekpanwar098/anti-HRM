import { Schema, model, Types } from "mongoose";

export interface IEmployee {
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  joinDate: Date;
  baseSalary: number;
  isActive: boolean;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joinDate: { type: Date, required: true },
    baseSalary: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
export type EmployeeId = Types.ObjectId;