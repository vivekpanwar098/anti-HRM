import { Schema, model, Types } from "mongoose";

export type PayrollStatus =
  | "draft"
  | "calculated"
  | "approved"
  | "paid";

export interface IPayroll {
  employee: Types.ObjectId;

  month: number;
  year: number;

  baseSalary: number;

  scheduledWorkingDays: number;
  workedDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;

  paidDays: number;
  payableSalary: number;

  status: PayrollStatus;

  calculatedAt?: Date;
  calculatedBy?: Types.ObjectId;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    scheduledWorkingDays: {
      type: Number,
      required: true,
      min: 0,
    },

    workedDays: {
      type: Number,
      required: true,
      min: 0,
    },

    paidLeaveDays: {
      type: Number,
      required: true,
      min: 0,
    },

    unpaidLeaveDays: {
      type: Number,
      required: true,
      min: 0,
    },

    paidDays: {
      type: Number,
      required: true,
      min: 0,
    },

    payableSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "calculated", "approved", "paid"],
      default: "draft",
    },

    calculatedAt: {
      type: Date,
    },

    calculatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// One payroll record per employee per month
payrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

export const Payroll = model<IPayroll>("Payroll", payrollSchema);