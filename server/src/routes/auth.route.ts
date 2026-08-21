import { Router } from "express";
import { signin } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { signinSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/signin", validate(signinSchema), signin);

export default router;