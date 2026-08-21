
import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  markAttendance,
  getEmployeeAttendance,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.post("/employees", createEmployee);
router.get("/employees", listEmployees);
router.get("/employees/:id", getEmployeeById);
router.patch("/employees/:id", updateEmployee);
router.delete("/employees/:id", deactivateEmployee);

router.post("/attendance", markAttendance);
router.get("/attendance/:employeeId", getEmployeeAttendance);

export default router;