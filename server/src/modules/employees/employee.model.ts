import { Schema, model } from "mongoose";

export interface IEmployee {
  name: string;
  email: string;
  position: string;
  department: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
