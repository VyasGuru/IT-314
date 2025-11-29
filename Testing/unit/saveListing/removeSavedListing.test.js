import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/savedListing.models.js", () => ({
  SavedListing: {
    findOneAndDelete: vi.fn(),
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
    constructor(status, message) {
      super(message);
      this.status = status;
      this.message = message;
    }
  },
}));

vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}));

import { SavedListing } from "../../src/models/savedListing.models.js";
import { removeSavedListing } from "../../src/controllers/savedListing.controller.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { _id: "user123" };
  next();
});

app.delete("/remove/:propertyId", removeSavedListing);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

beforeEach(() => vi.clearAllMocks());

describe("removeSavedListing", () => {
  it("should return 404 when saved listing does not exist", async () => {
    SavedListing.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app).delete("/remove/prop1");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Saved listing not found");
  });

  it("should remove saved listing successfully", async () => {
    SavedListing.findOneAndDelete.mockResolvedValue({ _id: "del123" });

    const res = await request(app).delete("/remove/prop1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Listing removed successfully.");
  });

  it("should return 500 when database error occurs", async () => {
    SavedListing.findOneAndDelete.mockRejectedValue(
      new Error("DB error")
    );

    const res = await request(app).delete("/remove/prop1");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("DB error");
  });
});
