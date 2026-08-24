import "./config/env.js";

import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { isDBConnected } from "./config/db.js";
import routes from "./routes.js";

const app: Application = express();

app.use(cors());
app.use(express.json());

// block requests if DB is down — placed after body parsing, before routes.
// skipped when NODE_ENV=test so API tests can run without a Mongo connection
app.use((_req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV !== "test" && !isDBConnected()) {
    res.status(503).json({ message: "Database unavailable, please try again later" });
    return;
  }
  next();
});

app.use("/api/v1/", routes);

app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
});

app.get("/health/db", (_req: Request, res: Response): void => {
  res.json({ db: isDBConnected() ? "connected" : "disconnected" });
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
});

// basic error handler — keep last
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
);
