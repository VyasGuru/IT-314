// import
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// controller import
import {
  getDailyReport,
  resetDailyReport,
} from "../../src/controllers/report.controller.js";

// mock services
vi.mock("../../src/services/stats.service.js", () => ({
  getDailySummary: vi.fn(),
  resetDailyStats: vi.fn(),
}));

// mock ApiResponse
vi.mock("../../src/utils/ApiResponse.js", () => ({
  ApiResponse: vi.fn().mockImplementation(function (status, data, message) {
    this.status = status;
    this.data = data;
    this.message = message;
  }),
}));

import {
  getDailySummary,
  resetDailyStats,
} from "../../src/services/stats.service.js";

let app;
let mockUser;

beforeEach(() => {
  app = express();
  app.use(express.json());

  // inject req.user properly for every request
  app.use((req, res, next) => {
    req.user = mockUser; 
    next();
  });

  app.get("/daily-report", (req, res, next) =>
    getDailyReport(req, res, next)
  );

  app.post("/daily-reset", (req, res, next) =>
    resetDailyReport(req, res, next)
  );

  vi.clearAllMocks();
});

describe("Daily Report Controller", () => {
  it("returns summary with user name", async () => {
    mockUser = { name: "Nandini" };
    const mockSummary = { totalSales: 50 };
    getDailySummary.mockResolvedValue(mockSummary);

    const res = await request(app).get("/daily-report");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockSummary);
    expect(res.body.message).toBe("Daily summary requested by Nandini");
  });

  it("returns summary without user name", async () => {
    mockUser = null;
    const mockSummary = { totalUsers: 100 };
    getDailySummary.mockResolvedValue(mockSummary);

    const res = await request(app).get("/daily-report");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockSummary);
    expect(res.body.message).toBe("Daily summary requested by Admin");
  });

  it("resets stats with user name", async () => {
    mockUser = { name: "Namna" };
    const mockResult = { reset: true };
    resetDailyStats.mockResolvedValue(mockResult);

    const res = await request(app).post("/daily-reset");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockResult);
    expect(res.body.message).toBe("Namna reset the daily statistics");
  });

  it("resets stats without user name", async () => {
    mockUser = null;
    const mockResult = { reset: true };
    resetDailyStats.mockResolvedValue(mockResult);

    const res = await request(app).post("/daily-reset");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockResult);
    expect(res.body.message).toBe("Admin reset the daily statistics");
  });
});
