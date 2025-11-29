import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock models
vi.mock("../../src/models/propertyComparison.models.js", () => ({
  PropertyComparison: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("../../src/utils/ApiResponse.js", () => ({
  ApiResponse: class {
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
      this.name = "ApiError";
    }
  },
}));

vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
}));

// Import
import { PropertyComparison } from "../../src/models/propertyComparison.models.js";
import {
  addPropertyToComparison,
  removePropertyFromComparison,
  getComparedProperties,
  clearComparison,
} from "../../src/controllers/propertyComparison.controller.js";

const app = express();
app.use(express.json());

// Mock middleware to set user
app.use((req, res, next) => {
  req.user = { _id: "userId123" };
  next();
});

// Routes
app.post("/comparison/add", addPropertyToComparison);
app.delete("/comparison/remove/:propertyId", removePropertyFromComparison);
app.get("/comparison/get", getComparedProperties);
app.delete("/comparison/clear", clearComparison);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("removePropertyFromComparison", () => {
  it("should throw error if comparison not found", async () => {
    PropertyComparison.findOne.mockResolvedValue(null);

    const res = await request(app).delete("/comparison/remove/prop1");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Comparison not found for this user");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
        userFirebaseUid: "userId123"
      });

  });

  it("should remove property from comparison successfully", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: ["prop1", "prop2"],
      save: vi.fn().mockResolvedValue(true),
    };

    PropertyComparison.findOne.mockResolvedValue(mockComparison);

    const res = await request(app).delete("/comparison/remove/prop1");

    expect(res.status).toBe(200);
    expect(mockComparison.propertyIds).toEqual(["prop2"]);
    expect(mockComparison.save).toHaveBeenCalled();
    expect(res.body.message).toBe("Property removed from comparison successfully");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
  userFirebaseUid: "userId123"
});


  });

  it("should handle database error in removePropertyFromComparison", async () => {
    PropertyComparison.findOne.mockRejectedValue(
      new Error("Database connection error")
    );

    const res = await request(app).delete("/comparison/remove/prop1");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Error while remove property from comparison");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
     userFirebaseUid: "userId123"
    });

  });

  it("should correctly filter out matching propertyId with ObjectId toString", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: [
        { toString: () => "prop1" },
        { toString: () => "prop2" },
      ],
      save: vi.fn().mockResolvedValue(true),
    };

    PropertyComparison.findOne.mockResolvedValue(mockComparison);

    const res = await request(app).delete("/comparison/remove/prop1");

    expect(res.status).toBe(200);
    expect(mockComparison.propertyIds.length).toBe(1);
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
    userFirebaseUid: "userId123"
    });
    

  });
});
