import { type Request, type Response } from "express";
import { Leave } from "../models/Leave.js";
import { Employee } from "../models/Employee.js";
import { Types } from "mongoose";


interface EmployeeParams {
  employeeId: string;
  
}

interface LeaveParams {
  id: string;
}

// Create leave request
export const createLeave = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      employee,
      startDate,
      endDate,
      reason,
    } = req.body;

    // Basic validation
    if (!employee || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Employee, start date and end date are required",
      });
    }

    // Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    // Calculate total leave days
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const totalDays =
      Math.floor(
        (end.getTime() - start.getTime()) /
          millisecondsPerDay
      ) + 1;

    // Create leave request
    const leave = await Leave.create({
      employee,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Create leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create leave request",
    });
  }
};



/**
 * GET ALL LEAVES
 * Admin can see all leave requests.
 */
export const getAllLeaves = async (
  req: Request,
  res: Response
) => {
  try {
    const leaves = await Leave.find()
      .populate(
        "employee",
        "name email department designation"
      )
      .populate(
        "approvedBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
    });
  }
};


/**
 * GET LEAVE BY ID
 */
export const getLeaveById = async (
 req: Request<LeaveParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const leave = await Leave.findById(id)
      .populate(
        "employee",
        "name email department designation"
      )
      .populate(
        "approvedBy",
        "name email"
      );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Get leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave request",
    });
  }
};


/**
 * APPROVE LEAVE
 */
export const approveLeave = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // ID of admin/manager approving the leave
    const { approvedBy } = req.body;

  if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    if (
      approvedBy &&
      !Types.ObjectId.isValid(approvedBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid approver ID",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Only pending leaves can be approved
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `Leave cannot be approved because it is already ${leave.status}`,
      });
    }

    leave.status = "approved";

    if (approvedBy) {
      leave.approvedBy = new Types.ObjectId(
        approvedBy
      );
    }

    leave.approvedAt = new Date();

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Approve leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve leave",
    });
  }
};


/**
 * REJECT LEAVE
 */
export const rejectLeave = async (
 req: Request<LeaveParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Only pending leaves can be rejected
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `Leave cannot be rejected because it is already ${leave.status}`,
      });
    }

    leave.status = "rejected";

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Reject leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject leave",
    });
  }
};


/**
 * CANCEL LEAVE
 */
export const cancelLeave = async (
  req: Request,
  res: Response
) => {
  try {
  const id = req.params.id as string;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Only pending or approved leaves can be cancelled
    if (
      leave.status !== "pending" &&
      leave.status !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Leave cannot be cancelled because it is already ${leave.status}`,
      });
    }

    leave.status = "cancelled";

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave cancelled successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Cancel leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel leave",
    });
  }
};


/**
 * GET LEAVE BALANCE
 *
 * Company policy:
 * Employee gets 2 paid leaves per month.
 */
export const getLeaveBalance = async (
  req: Request<EmployeeParams>,
  res: Response
) => {
  try {
    const { employeeId } = req.params;
    

    if (!Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findById(
      employeeId
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const currentDate = new Date();

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Start of current month
    const startOfMonth = new Date(
      year,
      month,
      1,
      0,
      0,
      0,
      0
    );

    // Start of next month
    const startOfNextMonth = new Date(
      year,
      month + 1,
      1,
      0,
      0,
      0,
      0
    );

    // Get approved leaves for this month
    const approvedLeaves = await Leave.find({
      employee: new Types.ObjectId(employeeId), 
      status: "approved",

      startDate: {
        $lt: startOfNextMonth,
      },

      endDate: {
        $gte: startOfMonth,
      },
    });

    let usedLeaveDays = 0;

    for (const leave of approvedLeaves) {
      usedLeaveDays += leave.totalDays;
    }

    const monthlyPaidLeave = 2;

    const paidLeaveUsed = Math.min(
      usedLeaveDays,
      monthlyPaidLeave
    );

    const remainingPaidLeave = Math.max(
      monthlyPaidLeave - paidLeaveUsed,
      0
    );

    const unpaidLeaveDays = Math.max(
      usedLeaveDays - monthlyPaidLeave,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        employeeId,

        month: month + 1,
        year,

        monthlyPaidLeave,

        usedLeaveDays,

        paidLeaveUsed,

        remainingPaidLeave,

        unpaidLeaveDays,
      },
    });
  } catch (error) {
    console.error("Get leave balance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave balance",
    });
  }
};