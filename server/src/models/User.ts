import { Schema, model, Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string; // hashed
  role: "admin" | "employee";
  employee?: Types.ObjectId; // ref -> Employee, only required for role "employee"
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: function (this: IUser) {
        return this.role === "employee";
      },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);