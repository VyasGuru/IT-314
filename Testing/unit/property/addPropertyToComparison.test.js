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

describe("addPropertyToComparison", () => {
  it("should throw error if propertyId is missing", async () => {
    const res = await request(app).post("/comparison/add").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Property ID is required");
  });

  it("should create new comparison if not exists", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: ["prop1"],
    };

    PropertyComparison.findOne.mockResolvedValue(null);
    PropertyComparison.create.mockResolvedValue(mockComparison);

    const res = await request(app)
      .post("/comparison/add")
      .send({ propertyId: "prop1" });

    expect(res.status).toBe(200);
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
      userFirebaseUid: "userId123",
    });
    expect(PropertyComparison.create).toHaveBeenCalledWith({
      userFirebaseUid: "userId123",
      propertyIds: ["prop1"],
    });
    expect(res.body.message).toBe("Property added for comparison successfully");
  });

  it("should add property to existing comparison if not duplicate", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: ["prop1"],
      save: vi.fn().mockResolvedValue(true),
    };

    PropertyComparison.findOne.mockResolvedValue(mockComparison);

    const res = await request(app)
      .post("/comparison/add")
      .send({ propertyId: "prop2" });

    expect(res.status).toBe(200);
    expect(mockComparison.propertyIds).toContain("prop2");
    expect(mockComparison.save).toHaveBeenCalled();
    expect(res.body.message).toBe("Property added for comparison successfully");
    expect(PropertyComparison.findOne).toHaveBeenCalledWith({
       userFirebaseUid: "userId123"
    });

  });

  it("should throw error if property already exists in comparison", async () => {
    const mockComparison = {
      userFirebaseUid: "userId123",
      propertyIds: ["prop1"],
    };

    PropertyComparison.findOne.mockResolvedValue(mockComparison);

    const res = await request(app)
      .post("/comparison/add")
      .send({ propertyId: "prop1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Property already added for comparison");
  });

  it("should handle database error in addPropertyToComparison", async () => {
    PropertyComparison.findOne.mockRejectedValue(
      new Error("Database error")
    );

    const res = await request(app)
      .post("/comparison/add")
      .send({ propertyId: "prop1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Error while adding property to comparison");
  });
});

