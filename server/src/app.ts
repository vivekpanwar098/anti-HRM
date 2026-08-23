import express from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());



app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// basic error handler — keep last
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
);
