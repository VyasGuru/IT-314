import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/property.models.js", () => ({
  Property: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}));

vi.mock("../../src/models/listing.models.js", () => ({
  Listing: {
    findOne: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}));

vi.mock("../../src/models/review.models.js", () => ({
  Review: {
    deleteMany: vi.fn()
  }
}));

vi.mock("../../src/utils/cloudinary.js", () => ({
  deleteFromCloudinary: vi.fn()
}));

vi.mock("../../src/utils/asyncHandler.js", () => ({
  asyncHandler: (fn) => (req, res, next) =>
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

import { Property } from "../../src/models/property.models.js";
import { Listing } from "../../src/models/listing.models.js";
import { Review } from "../../src/models/review.models.js";
import { deleteFromCloudinary } from "../../src/utils/cloudinary.js";
import { deleteProperty } from "../../src/controllers/property.controller.js";

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.delete("/delete/:propertyId", deleteProperty);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
};

const propertyMock = {
  _id: "p1",
  images: ["img1.jpg", "img2.jpg"]
};

const listingMock = {
  _id: "l1",
  propertyId: "p1"
};

beforeEach(() => vi.clearAllMocks());

describe("deleteProperty", () => {
  it("fails if property not found", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(null);

    const res = await request(app).delete("/delete/123");
    expect(res.status).toBe(404);
  });

  it("fails if listing not found", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(propertyMock);
    Listing.findOne.mockResolvedValue(null);

    const res = await request(app).delete("/delete/123");
    expect(res.status).toBe(404);
  });

  it("deletes images from Cloudinary", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(propertyMock);
    Listing.findOne.mockResolvedValue(listingMock);
    Review.deleteMany.mockResolvedValue(true);
    Property.findByIdAndDelete.mockResolvedValue(true);
    Listing.findByIdAndDelete.mockResolvedValue(true);
    deleteFromCloudinary.mockResolvedValue(true);

    const res = await request(app).delete("/delete/p1");

    expect(res.status).toBe(200);
    expect(deleteFromCloudinary).toHaveBeenCalledTimes(2);
    expect(deleteFromCloudinary).toHaveBeenCalledWith("img1.jpg");
    expect(deleteFromCloudinary).toHaveBeenCalledWith("img2.jpg");
  });

  it("deletes reviews, property, and listing", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(propertyMock);
    Listing.findOne.mockResolvedValue(listingMock);

    Review.deleteMany.mockResolvedValue(true);
    Property.findByIdAndDelete.mockResolvedValue(true);
    Listing.findByIdAndDelete.mockResolvedValue(true);
    deleteFromCloudinary.mockResolvedValue(true);

    const res = await request(app).delete("/delete/p1");

    expect(res.status).toBe(200);
    expect(Review.deleteMany).toHaveBeenCalled();
    expect(Property.findByIdAndDelete).toHaveBeenCalledWith("p1");
    expect(Listing.findByIdAndDelete).toHaveBeenCalledWith("l1");
  });

  it("returns success message", async () => {
    const app = makeApp();
    Property.findById.mockResolvedValue(propertyMock);
    Listing.findOne.mockResolvedValue(listingMock);

    Review.deleteMany.mockResolvedValue(true);
    Property.findByIdAndDelete.mockResolvedValue(true);
    Listing.findByIdAndDelete.mockResolvedValue(true);
    deleteFromCloudinary.mockResolvedValue(true);

    const res = await request(app).delete("/delete/p1");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Property, listing, reviews, and images deleted");
  });
});
