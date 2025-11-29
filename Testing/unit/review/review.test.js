// import
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// import
import {
  submitReview,
  getPropertyReviews,
} from "../../src/controllers/review.controller.js";

// mock
vi.mock("../../src/models/review.models.js", () => ({
  Review: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../../src/models/property.models.js", () => ({
  Property: {
    findById: vi.fn(),
  },
}));

// mock
vi.mock("../../src/utils/ApiResponse.js", () => ({
  ApiResponse: vi.fn().mockImplementation(function (status, data, message) {
    this.status = status;
    this.data = data;
    this.message = message;
  }),
}));

// import
import { Review } from "../../src/models/review.models.js";
import { Property } from "../../src/models/property.models.js";

let app;
let mockUser;

// setup
beforeEach(() => {
  app = express();
  app.use(express.json());

  // user middleware
  app.use((req, res, next) => {
    req.user = mockUser;
    next();
  });

  // routes
  app.post("/submit", (req, res, next) => submitReview(req, res, next));
  app.get("/reviews/:propertyId", (req, res, next) =>
    getPropertyReviews(req, res, next)
  );

  vi.clearAllMocks();
});

describe("submitReview", () => {
  it("fails when propertyId or rating missing", async () => {
    mockUser = { _id: "U1" };

    const res = await request(app).post("/submit").send({
      comment: "test",
    });

    expect(res.status).toBe(500);
  });

  it("fails when rating invalid", async () => {
    mockUser = { _id: "U1" };

    const res = await request(app).post("/submit").send({
      propertyId: "P1",
      rating: 10,
    });

    expect(res.status).toBe(500);
  });

  it("fails when property not found", async () => {
    mockUser = { _id: "U1" };
    Property.findById.mockResolvedValue(null);

    const res = await request(app).post("/submit").send({
      propertyId: "P1",
      rating: 4,
    });

    expect(res.status).toBe(500);
  });

  it("fails when user already reviewed", async () => {
    mockUser = { _id: "U1" };
    Property.findById.mockResolvedValue({ id: "P1" });
    Review.findOne.mockResolvedValue({ id: "R1" });

    const res = await request(app).post("/submit").send({
      propertyId: "P1",
      rating: 4,
    });

    expect(res.status).toBe(500);
  });

  it("submits a review successfully", async () => {
    mockUser = { _id: "U1" };

    Property.findById.mockResolvedValue({ id: "P1" });
    Review.findOne.mockResolvedValue(null);

    const mockReview = {
      id: "R1",
      rating: 4,
      comment: "Nice",
      populate: vi.fn().mockResolvedValue(true),
    };

    Review.create.mockResolvedValue(mockReview);

    const res = await request(app).post("/submit").send({
      propertyId: "P1",
      rating: 4,
      comment: "Nice",
    });

    expect(res.status).toBe(201);

    expect(res.body.data).toMatchObject({
      id: "R1",
      rating: 4,
      comment: "Nice",
    });

    expect(res.body.message).toBe("Review submitted successfully");
  });
});

describe("getPropertyReviews", () => {
  it("fails when propertyId missing", async () => {
    const res = await request(app).get("/reviews/");

    expect(res.status).toBe(404);
  });

  it("fails when property not found", async () => {
    Property.findById.mockResolvedValue(null);

    const res = await request(app).get("/reviews/P1");

    expect(res.status).toBe(500);
  });

  it("returns reviews with average rating", async () => {
    Property.findById.mockResolvedValue({ id: "P1" });

    const mockReviews = [
      { rating: 4, reviewerId: {} },
      { rating: 2, reviewerId: {} },
    ];

    Review.find.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue(mockReviews),
    });

    const res = await request(app).get("/reviews/P1");

    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBe(2);
    expect(res.body.data.averageRating).toBe(3.0);
    expect(res.body.message).toBe("Reviews retrieved successfully");
  });
});
