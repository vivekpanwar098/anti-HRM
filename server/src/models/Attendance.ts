
import { Schema, model, Types } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "half-day" | "leave";

export interface IAttendance {
  employee: Types.ObjectId; // ref -> Employee
  date: Date; // normalized to midnight, represents the calendar day
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  remarks?: string;
  markedBy?: Types.ObjectId; // ref -> User (admin who marked it, if applicable)
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "half-day", "leave"],
      required: true,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    remarks: { type: String },
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// prevent duplicate attendance entries for the same employee on the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);