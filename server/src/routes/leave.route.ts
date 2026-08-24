import { Router } from "express";
import { approveLeave, cancelLeave, createLeave, getAllLeaves, getLeaveBalance, getLeaveById, rejectLeave } from "../controllers/leave.controller.js";



const router = Router();

router.post("/", createLeave);

router.get("/", getAllLeaves);

router.get("/balance/:employeeId", getLeaveBalance);

router.get("/:id", getLeaveById);

router.patch("/:id/approve", approveLeave);

router.patch("/:id/reject", rejectLeave);

router.patch("/:id/cancel", cancelLeave);

export default router;