import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

// Mock models
vi.mock("../../src/models/property.models.js", () => ({
  Property: { findById: vi.fn() }
}));

vi.mock("../../src/models/listing.models.js", () => ({
  Listing: { findOne: vi.fn() }
}));

// These services DO exist, so we mock them
vi.mock("../../src/services/stats.service.js", () => ({
  recordStatusChange: vi.fn().mockResolvedValue(true)
}));

vi.mock("../../src/services/notification.service.js", () => ({
  createListerNotification: vi.fn().mockResolvedValue(true)
}));

// Mock async utils
vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),
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
    }
  },
}));

// Import after mocks
import { Property } from "../../src/models/property.models.js";
import { Listing } from "../../src/models/listing.models.js";
import { recordStatusChange } from "../../src/services/stats.service.js";
import { createListerNotification } from "../../src/services/notification.service.js";
import { reviewPropertyStatus } from "../../src/controllers/property.controller.js";

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: "admin1", name: "Admin" };
    next();
  });
  app.put("/review/:propertyId", reviewPropertyStatus);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
};

// Mock data
const validProperty = {
  _id: new mongoose.Types.ObjectId(),
  title: "Dream Apartment"
};

const validListing = {
  _id: "L123",
  propertyId: validProperty._id,
  listerFirebaseUid: "u456",
  status: "pending",
  save: vi.fn().mockResolvedValue(true)
};

beforeEach(() => vi.clearAllMocks());

// TEST SUITE
describe("reviewPropertyStatus", () => {
  it("fails on invalid status", async () => {
    const app = makeApp();

    const res = await request(app)
      .put("/review/123")
      .send({ status: "wrong" });

    expect(res.status).toBe(400);
  });

  it("fails on invalid property id", async () => {
    const app = makeApp();

    const res = await request(app)
      .put("/review/notvalid")
      .send({ status: "approved" });

    expect(res.status).toBe(400);
  });

  it("fails if property not found", async () => {
    const app = makeApp();

    Property.findById.mockResolvedValue(null);

    const res = await request(app)
      .put(`/review/${new mongoose.Types.ObjectId()}`)
      .send({ status: "approved" });

    expect(res.status).toBe(404);
  });

  it("fails if listing not found", async () => {
    const app = makeApp();

    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put(`/review/${validProperty._id}`)
      .send({ status: "approved" });

    expect(res.status).toBe(404);
  });

  it("approves a property", async () => {
    const app = makeApp();

    const listingClone = {
      ...validListing,
      save: vi.fn().mockResolvedValue(validListing)
    };

    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(listingClone);

    const res = await request(app)
      .put(`/review/${validProperty._id}`)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(listingClone.status).toBe("verified");
    expect(listingClone.verifiedAt).toBeDefined();
    expect(listingClone.verifiedByAdminUid).toBe("admin1");
    expect(listingClone.rejectionReason).toBeUndefined();
  });

  it("rejects a property", async () => {
    const app = makeApp();

    const listingClone = {
      ...validListing,
      save: vi.fn().mockResolvedValue(validListing)
    };

    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(listingClone);

    const res = await request(app)
      .put(`/review/${validProperty._id}`)
      .send({ status: "rejected", message: "Bad photos" });

    expect(res.status).toBe(200);
    expect(listingClone.status).toBe("rejected");
    expect(listingClone.rejectionReason).toBe("Bad photos");
  });

  it("sets property to pending", async () => {
    const app = makeApp();

    const listingClone = {
      ...validListing,
      save: vi.fn().mockResolvedValue(validListing)
    };

    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(listingClone);

    const res = await request(app)
      .put(`/review/${validProperty._id}`)
      .send({ status: "pending" });

    expect(res.status).toBe(200);
    expect(listingClone.status).toBe("pending");
    expect(listingClone.rejectionReason).toBeUndefined();
  });

  it("calls stats + notification services", async () => {
    const app = makeApp();

    const listingClone = {
      ...validListing,
      save: vi.fn().mockResolvedValue(validListing)
    };

    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(listingClone);

    await request(app)
      .put(`/review/${validProperty._id}`)
      .send({ status: "approved" });

    expect(recordStatusChange).toHaveBeenCalledOnce();
    expect(createListerNotification).toHaveBeenCalledOnce();
  });
});

