import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock Listing model
vi.mock("../../src/models/listing.models.js", () => ({
  Listing: {
    find: vi.fn(() => ({
      populate: vi.fn() // populated later in tests
    }))
  }
}));

// Mock ApiResponse + ApiError + asyncHandler
vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}));

vi.mock("../../src/utils/ApiResponse.js", () => ({
  ApiResponse: class {
    constructor(status, data, message) {
      this.status = status;
      this.data = data;
      this.message = message;
    }
  }
}));

vi.mock("../../src/utils/ApiError.js", () => ({
  ApiError: class ApiError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
}));

import { Listing } from "../../src/models/listing.models.js";
import { getUserListings } from "../../src/controllers/property.controller.js";

const makeApp = () => {
  const app = express();
  app.use(express.json());

  // default mock user
  app.use((req, res, next) => {
    req.user = { _id: "u1" };
    next();
  });

  app.get("/listings", getUserListings);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  return app;
};

beforeEach(() => vi.clearAllMocks());

describe("getUserListings", () => {
  it("fails if user not authenticated", async () => {
    const app = express();
    app.get("/listings", (req, res, next) => {
      req.user = {}; // missing _id
      next();
    }, getUserListings);

    const res = await request(app).get("/listings");
    expect(res.status).toBe(400);
  });

  it("returns empty list if no listings found", async () => {
    const app = makeApp();

    Listing.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([]),
    });

    const res = await request(app).get("/listings");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toBe("No listings found for this user");
  });

  it("filters out listings with missing propertyId", async () => {
    const app = makeApp();

    const fakeListings = [
      { _id: "1", status: "pending", createdAt: "", updatedAt: "", propertyId: null }, // should be removed
      { 
        _id: "2", 
        status: "active", 
        rejectionReason: null,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-02",
        propertyId: {
          _id: "p1",
          title: "House",
          description: "Nice home",
          price: 500000,
          location: { city: "Delhi" },
          images: ["img.jpg"],
          propertyType: "flat",
          bedrooms: 2,
          bathrooms: 2,
          size: 900,
          yearBuild: 2010
        }
      }
    ];

    Listing.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue(fakeListings),
    });

    const res = await request(app).get("/listings");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].listingId).toBe("2");
  });

  it("returns formatted user listings", async () => {
    const app = makeApp();

    const fakeListings = [
      {
        _id: "L1",
        status: "active",
        rejectionReason: null,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-02",
        propertyId: {
          _id: "P1",
          title: "Luxury Villa",
          description: "Beautiful villa",
          price: 1000000,
          location: { city: "Mumbai" },
          images: ["villa.jpg"],
          propertyType: "villa",
          bedrooms: 4,
          bathrooms: 3,
          size: 2500,
          yearBuild: 2015
        }
      }
    ];

    Listing.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue(fakeListings),
    });

    const res = await request(app).get("/listings");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);

    const listing = res.body.data[0];

    expect(listing.listingId).toBe("L1");
    expect(listing.property.title).toBe("Luxury Villa");
    expect(listing.property.price).toBe(1000000);
    expect(listing.status).toBe("active");
  });
});
