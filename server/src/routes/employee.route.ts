
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getMyProfile, getMyAttendance } from "../controllers/employee.controller.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyProfile);
router.get("/me/attendance", getMyAttendance);

export default router;