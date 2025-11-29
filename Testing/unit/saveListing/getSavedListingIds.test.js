import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/savedListing.models.js", () => ({
  SavedListing: {
    find: vi.fn(() => ({
      select: vi.fn().mockResolvedValue([]),
    })),
  },
}));

vi.mock("../../src/utils/ApiResponse.js", () => ({
  ApiResponse: class ApiResponse {
    constructor(status, data, message) {
      this.status = status;
      this.data = data;
      this.message = message;
    }
  },
}));

vi.mock("../../src/utils/ApiError.js", () => ({
  ApiError: class ApiError extends Error {
    constructor(s, m) {
      super(m);
      this.status = s;
    }
  },
}));

vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}));

import { SavedListing } from "../../src/models/savedListing.models.js";
import { getSavedListingIds } from "../../src/controllers/savedListing.controller.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { _id: "user123" };
  next();
});

app.get("/saved-ids", getSavedListingIds);

app.use((e, req, res, n) => {
  res.status(e.status || 500).json({ message: e.message });
});

beforeEach(() => vi.clearAllMocks());

describe("getSavedListingIds", () => {
  it("should return empty array when no saved IDs exist", async () => {
    SavedListing.find.mockReturnValueOnce({
      select: () => Promise.resolve([]),
    });

    const res = await request(app).get("/saved-ids");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return saved listing IDs", async () => {
    const mockIds = [
      { listingId: "p1" },
      { listingId: "p2" },
    ];

    SavedListing.find.mockReturnValueOnce({
      select: () => Promise.resolve(mockIds),
    });

    const res = await request(app).get("/saved-ids");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(["p1", "p2"]);
  });

  it("should return 500 on database error", async () => {
    SavedListing.find.mockReturnValueOnce({
      select: () => Promise.reject(new Error("DB error")),
    });

    const res = await request(app).get("/saved-ids");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("DB error");
  });
});
