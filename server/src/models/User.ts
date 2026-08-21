import { Schema, model, Types } from "mongoose";

export interface IUser {
  email: string;
  password: string; // hashed
  role: "admin" | "employee";
  employee: Types.ObjectId; // ref -> Employee
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);