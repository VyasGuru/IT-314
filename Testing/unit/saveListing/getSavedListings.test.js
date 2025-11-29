import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/savedListing.models.js", () => ({
  SavedListing: {
    find: vi.fn(() => ({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([]),
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
import { getSavedListings } from "../../src/controllers/savedListing.controller.js";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { _id: "user123" };
  next();
});

app.get("/saved", getSavedListings);

app.use((e, req, res, n) => {
  res.status(e.status || 500).json({ message: e.message });
});

beforeEach(() => vi.clearAllMocks());

describe("getSavedListings", () => {
  it("should return empty list when user has no saved listings", async () => {
    SavedListing.find.mockReturnValueOnce({
      populate: () => ({
        sort: () => Promise.resolve([]),
      }),
    });

    const res = await request(app).get("/saved");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return saved listings", async () => {
    const mockData = [
      { _id: "1", listingId: { title: "House" } },
    ];

    SavedListing.find.mockReturnValueOnce({
      populate: () => ({
        sort: () => Promise.resolve(mockData),
      }),
    });

    const res = await request(app).get("/saved");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockData);
  });

  it("should return 500 on database error", async () => {
    SavedListing.find.mockReturnValueOnce({
      populate: () => ({
        sort: () => Promise.reject(new Error("DB error")),
      }),
    });

    const res = await request(app).get("/saved");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("DB error");
  });
});
