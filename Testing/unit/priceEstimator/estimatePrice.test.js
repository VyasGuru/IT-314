// import
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// mock Listing model
vi.mock("../../src/models/listing.models.js", () => ({
  Listing: {
    findById: vi.fn(),
    find: vi.fn()
  }
}));

// mock Property
vi.mock("../../src/models/property.models.js", () => ({
  Property: {}
}));

// mock asyncHandler
vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}));

// controller
import { estimatePrice, calculateSimilarityScore } from "../../src/controllers/priceEstimator.controller.js";

// express
const app = express();
app.use(express.json());
app.get("/api/estimate-price/:listingId", estimatePrice);

// error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Server Error" });
});

// import mocks
import { Listing } from "../../src/models/listing.models.js";

// helpers
const mockFindById = (value) => {
  Listing.findById.mockReturnValue({
    populate: vi.fn().mockResolvedValue(value)
  });
};

const mockFind = (value) => {
  Listing.find.mockReturnValue({
    populate: vi.fn().mockResolvedValue(value)
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("estimatePrice controller", () => {
  it("should return 404 when listing is not found", async () => {
    mockFindById(null);

    const res = await request(app).get("/api/estimate-price/x1");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Listing not found");
  });

  it("should return null estimates when no similar properties exist", async () => {
    const target = {
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "111" },
        propertyType: "sale",
        amenities: {},
        size: 1000,
        bedrooms: 2,
        bathrooms: 2,
        price: 500000
      }
    };

    mockFindById(target);
    mockFind([]);

    const res = await request(app).get("/api/estimate-price/x2");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Not enough similar properties found to provide an estimate."
    );
    expect(res.body.estimatedPrice).toBe(null);
    expect(res.body.estimatedRent).toBe(null);
  });

  it("should calculate estimatedPrice from similar properties", async () => {
    const base = {
      location: { locality: "A", city: "B", state: "C", zipCode: "222" },
      propertyType: "sale",
      amenities: {},
      size: 1000,
      bedrooms: 2,
      bathrooms: 2,
      price: 900000
    };

    mockFindById({ propertyId: base });

    mockFind([
      { propertyId: { ...base, price: 800000 } },
      { propertyId: { ...base, price: 850000 } },
      { propertyId: { ...base, price: 900000 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x3");

    expect(res.status).toBe(200);
    expect(res.body.estimatedPrice).toBeGreaterThan(0);
    expect(res.body.similarProperties.length).toBe(3);
  });

  it("should calculate estimatedRent for rental properties", async () => {
    const base = {
      location: { locality: "X", city: "Y", state: "Z", zipCode: "333" },
      propertyType: "rental",
      amenities: {},
      size: 800,
      bedrooms: 1,
      bathrooms: 1,
      price: 15000
    };

    mockFindById({ propertyId: base });

    mockFind([
      { propertyId: { ...base, price: 14000 } },
      { propertyId: { ...base, price: 16000 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x4");

    expect(res.status).toBe(200);
    expect(res.body.estimatedRent).toBeGreaterThan(0);
    expect(res.body.estimatedPrice).toBe(null);
  });

  it("should cover bathroom difference scoring", async () => {
    const target = {
      location: { locality: "A", city: "B", state: "C", zipCode: "444" },
      propertyType: "sale",
      amenities: {},
      size: 500,
      bedrooms: 1,
      bathrooms: 1,
      price: 100000
    };

    mockFindById({ propertyId: target });

    mockFind([
      {
        propertyId: {
          location: target.location,
          propertyType: "sale",
          amenities: {},
          size: 520,
          bedrooms: 1,
          bathrooms: 2,
          price: 120000
        }
      }
    ]);

    const res = await request(app).get("/api/estimate-price/x5");

    expect(res.status).toBe(200);
    expect(res.body.estimatedPrice).toBeGreaterThan(0);
  });

  it("should return 500 on error", async () => {
    Listing.findById.mockReturnValue({
      populate: vi.fn().mockRejectedValue(new Error("fail"))
    });

    const res = await request(app).get("/api/estimate-price/x6");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server Error");
  });

  it("should ignore listings not active or verified", async () => {
    const target = {
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "555" },
        propertyType: "sale",
        amenities: {},
        size: 1000,
        bedrooms: 2,
        bathrooms: 2,
        price: 900000
      }
    };

    mockFindById(target);

    mockFind([
      { status: "pending", propertyId: null },
      { status: "active", propertyId: { ...target.propertyId, price: 800000 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x7");

    expect(res.body.similarProperties.length).toBe(1);
  });

  it("should ignore listings with missing propertyId", async () => {
    const target = {
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "666" },
        propertyType: "sale",
        amenities: {},
        size: 400,
        bedrooms: 1,
        bathrooms: 1,
        price: 200000
      }
    };

    mockFindById(target);

    mockFind([
      { propertyId: null },
      { propertyId: { ...target.propertyId, price: 210000 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x8");

    expect(res.body.similarProperties.length).toBe(1);
  });

  it("should sort candidates by score", async () => {
    const base = {
      location: { locality: "A", city: "B", state: "C", zipCode: "777" },
      propertyType: "sale",
      amenities: {},
      size: 100,
      bedrooms: 1,
      bathrooms: 1,
      price: 100000
    };

    mockFindById({ propertyId: base });

    mockFind([
      { propertyId: { ...base, price: 200000, size: 100 } },
      { propertyId: { ...base, price: 500000, size: 900 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x9");

    expect(res.body.similarProperties[0].price).toBe(200000);
  });

  it("should compute correct average price", async () => {
    const target = {
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "888" },
        propertyType: "sale",
        amenities: {},
        size: 1200,
        bedrooms: 3,
        bathrooms: 2,
        price: 500000
      }
    };

    mockFindById(target);

    mockFind([
      { propertyId: { ...target.propertyId, price: 100000 } },
      { propertyId: { ...target.propertyId, price: 300000 } },
      { propertyId: { ...target.propertyId, price: 500000 } }
    ]);

    const res = await request(app).get("/api/estimate-price/x10");

    const expected = (100000 + 300000 + 500000) / 3;

    expect(res.body.estimatedPrice).toBe(expected);
  });

  it("should compute exact similarity score", () => {
    const target = {
      size: 1000,
      bedrooms: 2,
      bathrooms: 2,
      amenities: { pool: true, wifi: false }
    };

    const candidate = {
      size: 990,
      bedrooms: 3,
      bathrooms: 1,
      amenities: { pool: true, wifi: true }
    };

    const score = (1 / (1 + 10)) + (1 / (1 + 1)) + (1 / (1 + 1)) + 0.1;

    expect(calculateSimilarityScore(target, candidate)).toBeCloseTo(score, 5);
  });

  it("should add amenity score correctly", () => {
    const target = {
      size: 100,
      bedrooms: 1,
      bathrooms: 1,
      amenities: { wifi: true, lift: false, parking: true }
    };

    const candidate = {
      size: 100,
      bedrooms: 1,
      bathrooms: 1,
      amenities: { wifi: true, lift: true, parking: false }
    };

    const score = 1 + 1 + 1 + 0.1;

    expect(calculateSimilarityScore(target, candidate)).toBeCloseTo(score, 5);
  });

  it("should call populate with 'propertyId' for target listing", async () => {
    const populateMock = vi.fn().mockResolvedValue({
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "111" },
        propertyType: "sale",
        amenities: {},
        size: 100,
        bedrooms: 1,
        bathrooms: 1,
        price: 1000
      }
    });

    Listing.findById.mockReturnValue({ populate: populateMock });
    Listing.find.mockReturnValue({ populate: vi.fn().mockResolvedValue([]) });

    await request(app).get("/api/estimate-price/tp1");

    expect(populateMock).toHaveBeenCalledWith("propertyId");
  });

  it("should call Listing.find with correct filters", async () => {
    mockFindById({
      propertyId: {
        location: { locality: "L", city: "C", state: "S", zipCode: "999" },
        propertyType: "sale",
        amenities: {},
        size: 10,
        bedrooms: 1,
        bathrooms: 1,
        price: 100
      }
    });

    const findSpy = vi.fn().mockReturnValue({
      populate: vi.fn().mockResolvedValue([])
    });

    Listing.find.mockImplementation(findSpy);

    await request(app).get("/api/estimate-price/xyz");

    expect(findSpy).toHaveBeenCalledWith({
      status: { $in: ["active", "verified"] },
      _id: { $ne: "xyz" }
    });
  });

  it("should populate candidates with match conditions", async () => {
    const target = {
      propertyId: {
        location: { locality: "Loc", city: "C", state: "ST", zipCode: "505" },
        propertyType: "sale",
        amenities: {},
        size: 100,
        bedrooms: 2,
        bathrooms: 2,
        price: 200
      }
    };

    mockFindById(target);

    const populateMock = vi.fn().mockResolvedValue([]);

    Listing.find.mockReturnValue({ populate: populateMock });

    await request(app).get("/api/estimate-price/ppp");

    expect(populateMock).toHaveBeenCalledWith({
      path: "propertyId",
      match: {
        "location.locality": "Loc",
        "location.city": "C",
        "location.state": "ST",
        "location.zipCode": "505",
        propertyType: "sale"
      }
    });
  });

  it("should strictly sort candidates by descending similarity score", async () => {
    const target = {
      propertyId: {
        location: { locality: "A", city: "B", state: "C", zipCode: "999" },
        propertyType: "sale",
        amenities: {},
        size: 1000,
        bedrooms: 2,
        bathrooms: 2,
        price: 1000
      }
    };

    mockFindById(target);

    const candidateA = {
      propertyId: {
        ...target.propertyId,
        size: 1000,
        bedrooms: 2,
        bathrooms: 2,
        price: 300000
      }
    };

    const candidateB = {
      propertyId: {
        ...target.propertyId,
        size: 1200,
        bedrooms: 3,
        bathrooms: 3,
        price: 100000
      }
    };

    mockFind([candidateB, candidateA]);

    const res = await request(app).get("/api/estimate-price/x_sort");

    expect(res.status).toBe(200);
    expect(res.body.similarProperties.length).toBe(2);

    expect(res.body.similarProperties[0].price).toBe(300000);
    expect(res.body.similarProperties[1].price).toBe(100000);
  });
});
