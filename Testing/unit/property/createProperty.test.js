import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/user.models.js", () => ({
  User: { findOne: vi.fn() },
}));

vi.mock("../../src/models/property.models.js", () => {
  return {
    Property: vi.fn(function () {
      this.save = vi.fn().mockResolvedValue({ _id: "p1" });
    })
  };
});

vi.mock("../../src/models/listing.models.js", () => {
  return {
    Listing: vi.fn(function () {
      this.save = vi.fn().mockResolvedValue({ _id: "l1" });
    })
  };
});

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
  },
}));

import mongoose from "mongoose";
mongoose.startSession = vi.fn().mockResolvedValue({
  startTransaction: vi.fn(),
  commitTransaction: vi.fn(),
  abortTransaction: vi.fn(),
  endSession: vi.fn(),
});

import { User } from "../../src/models/user.models.js";
import { uploadOnCloudinary } from "../../src/utils/cloudinary.js";
import { createProperty } from "../../src/controllers/property.controller.js";

const baseApp = express();
baseApp.use(express.json());
baseApp.use((req, res, next) => {
  req.user = { firebaseUid: "u1", _id: "u1" };
  req.files = [{ path: "img1.jpg" }];
  next();
});
baseApp.post("/create", createProperty);
baseApp.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

beforeEach(() => vi.clearAllMocks());

const validBody = {
  title: "A",
  description: "B",
  yearBuild: 2000,
  propertyType: "flat",
  price: 100,
  size: 500,
  bedrooms: 2,
  bathrooms: 1,
  balconies: 1,
  amenities: "{}",
  location: "{}",
};

describe("createProperty", () => {
  it("fails if user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(baseApp).post("/create").send(validBody);
    expect(res.status).toBe(404);
  });

  it("fails if email not verified", async () => {
    User.findOne.mockResolvedValue({ emailVerified: false });
    const res = await request(baseApp).post("/create").send(validBody);
    expect(res.status).toBe(403);
  });

  it("fails if required fields missing", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    const body = { ...validBody, title: "" };
    const res = await request(baseApp).post("/create").send(body);
    expect(res.status).toBe(400);
  });

  it("fails if images missing", async () => {
    const temp = express();
    temp.use(express.json());
    temp.use((req, res, next) => {
      req.user = { firebaseUid: "u1", _id: "u1" };
      req.files = [];
      next();
    });
    temp.post("/create", createProperty);
    temp.use((err, req, res, next) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    User.findOne.mockResolvedValue({ emailVerified: true });

    const res = await request(temp).post("/create").send(validBody);
    expect(res.status).toBe(400);
  });

  it("fails if cloudinary upload fails", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    uploadOnCloudinary.mockResolvedValue(null);

    const res = await request(baseApp).post("/create").send(validBody);
    expect(res.status).toBe(500);
  });

  it("fails if amenities JSON invalid", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const body = { ...validBody, amenities: "{" };
    const res = await request(baseApp).post("/create").send(body);
    expect(res.status).toBe(500);
  });

  it("fails if location JSON invalid", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const body = { ...validBody, location: "{" };
    const res = await request(baseApp).post("/create").send(body);
    expect(res.status).toBe(500);
  });

  it("succeeds when valid", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const res = await request(baseApp).post("/create").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Property created successfully");
  });

  it("aborts transaction on internal error", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });
    uploadOnCloudinary.mockResolvedValue({ url: "img.jpg" });

    const { Property } = await import("../../src/models/property.models.js");
    Property.mockImplementation(function () {
      this.save = vi.fn().mockRejectedValue(new Error("fail"));
    });

    const res = await request(baseApp).post("/create").send(validBody);
    expect(res.status).toBe(500);
  });
});
