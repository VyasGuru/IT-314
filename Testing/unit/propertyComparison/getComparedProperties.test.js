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

describe("getComparedProperties", () => {

  it("should return 200 and empty array when no comparison found", async () => {
    PropertyComparison.findOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(null)
    });

    const res = await request(app).get("/comparison/get");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toContain("No properties selected for comparison");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
     userFirebaseUid: "userId123"
    });

  });

  it("should return 200 and empty array when propertyIds array is empty", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: [],
    };

    PropertyComparison.findOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockComparison)
    });

    const res = await request(app).get("/comparison/get");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toContain("No properties selected for comparison");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
      userFirebaseUid: "userId123"
  });

  });

  it("should return compared properties when properties exists", async () => {
    const mockProperties = ["prop1", "prop2", "prop3"];
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: mockProperties,
    };

    PropertyComparison.findOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockComparison)
    });

    const res = await request(app).get("/comparison/get");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockProperties);
    expect(res.body.message).toBe("Comparison properties retrieved successfully");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
      userFirebaseUid: "userId123"
    });

  });

  it("should handle database error in getComparedProperties", async () => {
    PropertyComparison.findOne.mockReturnValue({
      populate: vi.fn().mockRejectedValue(new Error("Query failed"))
    });

    const res = await request(app).get("/comparison/get");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Error while find comparison property");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
    userFirebaseUid: "userId123"
    });
    });

});

