import { Router } from "express";

import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import employeeRoutes from "./routes/employee.route.js";
import leaveRoutes from "./routes/leave.route.js"

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/admin", adminRoutes);
routes.use("/employee", employeeRoutes);
routes.use("/leaves", leaveRoutes);

export default routes;