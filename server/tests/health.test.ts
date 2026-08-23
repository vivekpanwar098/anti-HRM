import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("Health API", () => {
  describe("GET /health", () => {
    it("should return 200 with status ok when the server is up", async () => {
      // Act
      const res = await request(app).get("/health");

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });

    it("should return JSON content type", async () => {
      const res = await request(app).get("/health");

      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  describe("Unknown routes", () => {
    it("should return 404 with a JSON body for a route that does not exist", async () => {
      const res = await request(app).get("/does-not-exist");

      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(res.body).toEqual({ message: "Route not found" });
    });

    it("should return 404 when POST is used on a GET-only route", async () => {
      const res = await request(app).post("/health").send({});

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Route not found" });
    });
  });
});
