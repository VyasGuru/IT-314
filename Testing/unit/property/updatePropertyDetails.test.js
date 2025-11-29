import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/property.models.js", () => ({
  Property: {
    findById: vi.fn(),
  }
}));

vi.mock("../../src/models/listing.models.js", () => ({
  Listing: {
    findOne: vi.fn(),
  }
}));

vi.mock("../../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn(),
}));

vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
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
  }
}));

import { Property } from "../../src/models/property.models.js";
import { Listing } from "../../src/models/listing.models.js";
import { uploadOnCloudinary } from "../../src/utils/cloudinary.js";
import { updatePropertyDetails, updatePropertyStatus } from "../../src/controllers/property.controller.js";

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { firebaseUid: "user1", _id: "user1" };
    req.files = [{ path: "img.jpg" }];
    next();
  });
  app.put("/update/:propertyId", updatePropertyDetails);
  app.put("/status/:propertyId", updatePropertyStatus);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
};

const validProperty = {
  _id: "p1",
  title: "x",
  description: "x",
  yearBuild: 2000,
  propertyType: "flat",
  price: 100,
  size: 500,
  bedrooms: 2,
  bathrooms: 1,
  balconies: 1,
  images: [],
  amenities: {},
  location: {},
  priceHistory: [{ price: 100, reason: "Initial" }],
  save: vi.fn().mockResolvedValue(true)
};

const validListing = {
  _id: "l1",
  propertyId: "p1",
  listerFirebaseUid: "user1",
  status: "active",
  save: vi.fn().mockResolvedValue(true)
};

beforeEach(() => vi.clearAllMocks());

describe("updatePropertyDetails", () => {
  it("fails if property not found", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(null);

    const res = await request(app)
      .put("/update/123")
      .send({ title: "new" });

    expect(res.status).toBe(404);
  });

  it("fails if listing not found", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put("/update/123")
      .send({ title: "new" });

    expect(res.status).toBe(404);
  });

  it("fails on invalid JSON", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(validListing);

    const res = await request(app)
      .put("/update/123")
      .send({ amenities: "{" });

    expect(res.status).toBe(400);
  });

  it("uploads images when files exist", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(validProperty);
    Listing.findOne.mockResolvedValue(validListing);
    uploadOnCloudinary.mockResolvedValue({ url: "newimg.jpg" });

    const res = await request(app)
      .put("/update/123")
      .send({ title: "changed" });

    expect(res.status).toBe(200);
    expect(validProperty.images.includes("newimg.jpg")).toBe(true);
  });

  it("updates price and adds priceHistory entry", async () => {
    const app = makeApp();
    const propCopy = JSON.parse(JSON.stringify(validProperty));
    propCopy.save = vi.fn().mockResolvedValue(true);

    Property.findById.mockResolvedValue(propCopy);
    Listing.findOne.mockResolvedValue(validListing);
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const res = await request(app)
      .put("/update/123")
      .send({ price: 150 });

    expect(res.status).toBe(200);
    expect(propCopy.price).toBe(150);
    expect(propCopy.priceHistory.length).toBe(2);
  });

  it("successfully updates fields", async () => {
    const app = makeApp();
    const propCopy = JSON.parse(JSON.stringify(validProperty));
    propCopy.save = vi.fn().mockResolvedValue(true);

    Property.findById.mockResolvedValue(propCopy);
    Listing.findOne.mockResolvedValue(validListing);
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const res = await request(app)
      .put("/update/123")
      .send({ title: "newtitle", bedrooms: 3 });

    expect(res.status).toBe(200);
    expect(propCopy.title).toBe("newtitle");
    expect(propCopy.bedrooms).toBe(3);
  });
});


