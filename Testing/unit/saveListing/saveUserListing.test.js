import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

//mock the models and utilities
vi.mock("../../src/models/savedListing.models.js", () => ({
  SavedListing: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndDelete: vi.fn(),
    find: vi.fn(() => ({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([]),
      select: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock("../../src/models/property.models.js", () => ({
  Property: { findById: vi.fn() },
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
      this.name = "ApiError";
    }
  },
}));


vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}));

//import
import { SavedListing } from "../../src/models/savedListing.models.js";
import { Property } from "../../src/models/property.models.js";
import { saveUserListing } from "../../src/controllers/savedListing.controller.js";

const app = express();
app.use(express.json());

// Fake logged-in user
app.use((req, res, next) => {
  req.user = { _id: "user123" };
  next();
});

// Route
app.post("/save", saveUserListing);


app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

beforeEach(() => vi.clearAllMocks());

describe("saveUserListing", () => {
  it("should throw error when propertyId is missing", async () => {
    const res = await request(app).post("/save").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Property ID is required");
  });

  it("should throw error when property does not exist", async () => {
    Property.findById.mockResolvedValue(null);

    const res = await request(app)
      .post("/save")
      .send({ listingId: "prop1" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Property not found");
  });

  it("should return existing saved listing if already saved", async () => {
    Property.findById.mockResolvedValue({ _id: "prop1" });

    const existing = { _id: "saved123", userId: "user123", listingId: "prop1" };

    SavedListing.findOne.mockResolvedValue(existing);

    const res = await request(app)
      .post("/save")
      .send({ listingId: "prop1" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(existing);
    expect(res.body.message).toBe("Listing was already saved.");
    expect(SavedListing.findOne).toHaveBeenCalledWith({
  userId: "user123",
  listingId: "prop1"
});
  });

  it("should successfully save new listing", async () => {
    Property.findById.mockResolvedValue({ _id: "prop1" });
    SavedListing.findOne.mockResolvedValue(null);

    const newSaved = {
      _id: "saved456",
      userId: "user123",
      listingId: "prop1",
      notes: "my notes",
    };
    SavedListing.create.mockResolvedValue(newSaved);

    const res = await request(app)
      .post("/save")
      .send({ listingId: "prop1", notes: "my notes" });

    expect(res.status).toBe(201);
    expect(SavedListing.create).toHaveBeenCalledWith({
      userId: "user123",
      listingId: "prop1",
      notes: "my notes",
    });
    expect(res.body.data).toEqual(newSaved);
  });

  it("should save listing with empty notes when notes not provided", async () => {
    Property.findById.mockResolvedValue({ _id: "prop1" });
    SavedListing.findOne.mockResolvedValue(null);

    const newSaved = {
      _id: "saved789",
      userId: "user123",
      listingId: "prop1",
      notes: "",
    };
    SavedListing.create.mockResolvedValue(newSaved);

    const res = await request(app)
      .post("/save")
      .send({ listingId: "prop1" });

    expect(res.status).toBe(201);
    expect(SavedListing.create).toHaveBeenCalledWith({
      userId: "user123",
      listingId: "prop1",
      notes: "",
    });
  });
});
