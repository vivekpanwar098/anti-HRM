import "./config/env.js";

import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { connectDB, isDBConnected } from "./config/db.js";
import routes from "./routes.js"

const app: Application = express();

app.use(cors());
app.use(express.json());

// block requests if DB is down — placed after body parsing, before routes
app.use((_req: Request, res: Response, next: NextFunction): void => {
  if (!isDBConnected()) {
    res.status(503).json({ message: "Database unavailable, please try again later" });
    return;
  }
  next();
});


app.use("/api/v1/", routes);

app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok", db: isDBConnected() ? "connected" : "disconnected" });
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
});

// global error handler
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
);

const PORT: number = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, (): void => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();