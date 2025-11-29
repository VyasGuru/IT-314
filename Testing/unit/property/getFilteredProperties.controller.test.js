import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/models/property.models.js", () => ({
  Property: {
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  },
}));

import { Property } from "../../src/models/property.models.js";
import { getFilteredProperties } from "../../src/controllers/property.controller.js";

const app = express();
app.use(express.json());
app.get("/api/property/filter", getFilteredProperties);

describe("GET /api/property/filter - 100% coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Property.find.mockReturnThis();
    Property.sort = vi.fn().mockReturnThis();
    Property.exec = vi.fn().mockResolvedValue([{ dummy: true }]);
  });

  it("should return properties with no filters", async () => {
    const res = await request(app).get("/api/property/filter");
    expect(res.status).toBe(200);
    expect(Property.find).toHaveBeenCalled();
  });

  it("should apply searchTerm correctly", async () => {
    await request(app).get("/api/property/filter").query({ searchTerm: "villa" });
    expect(Property.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array)
      })
    );
  });

  it("should apply location filter", async () => {
    await request(app).get("/api/property/filter").query({ location: "Ahmedabad" });
    expect(Property.find).toHaveBeenCalledWith(
      expect.objectContaining({
        "location.city": expect.any(Object)
      })
    );
  });

  const priceRanges = ["0-100k", "100k-300k", "300k-500k", "500k-1m", "1m+"];
  priceRanges.forEach(range => {
    it(`should handle priceRange ${range}`, async () => {
      await request(app).get("/api/property/filter").query({ priceRange: range });
      expect(Property.find).toHaveBeenCalled();
    });
  });

 
  it("should handle minPrice only", async () => {
    await request(app).get("/api/property/filter").query({ minPrice: 1000 });
    expect(Property.find).toHaveBeenCalledWith(
      expect.objectContaining({
        price: { $gte: 1000 }
      })
    );
  });

  it("should handle maxPrice only", async () => {
    await request(app).get("/api/property/filter").query({ maxPrice: 8000 });
    expect(Property.find).toHaveBeenCalledWith(
      expect.objectContaining({
        price: { $lte: 8000 }
      })
    );
  });

  it("should handle minSize/maxSize", async () => {
    await request(app).get("/api/property/filter").query({ minSize: 500, maxSize: 1000 });
    expect(Property.find).toHaveBeenCalled();
  });


  it("should handle bedrooms normal number", async () => {
    await request(app).get("/api/property/filter").query({ bedrooms: 3 });
    expect(Property.find).toHaveBeenCalled();
  });

  it("should handle bedrooms 5+", async () => {
    await request(app).get("/api/property/filter").query({ bedrooms: "5+" });
    expect(Property.find).toHaveBeenCalled();
  });

  it("should handle bathrooms 4+", async () => {
    await request(app).get("/api/property/filter").query({ bathrooms: "4+" });
    expect(Property.find).toHaveBeenCalled();
  });

  it("should handle property type", async () => {
    await request(app).get("/api/property/filter").query({ propertyType: "apartment" });
    expect(Property.find).toHaveBeenCalled();
  });


  it("should handle year_built", async () => {
    await request(app).get("/api/property/filter").query({ year_built: 2010 });
    expect(Property.find).toHaveBeenCalled();
  });


  it("should handle amenities only", async () => {
    await request(app).get("/api/property/filter").query({ amenities: "parking,gym" });
    expect(Property.find).toHaveBeenCalled();
  });

  it("should handle amenities + searchTerm (AND branch)", async () => {
    await request(app).get("/api/property/filter")
      .query({ amenities: "parking", searchTerm: "villa" });
    expect(Property.find).toHaveBeenCalled();
  });

  const sorts = ["price-low", "price-high", "newest", "oldest", "featured", "unknown"];
  sorts.forEach(sort => {
    it(`should execute sortBy=${sort}`, async () => {
      await request(app).get("/api/property/filter").query({ sortBy: sort });
      expect(Property.sort).toHaveBeenCalled();
    });
  });

  it("should trigger catch block on error", async () => {
    Property.exec.mockRejectedValueOnce(new Error("DB FAILED"));
    const res = await request(app).get("/api/property/filter");
    expect(res.status).toBe(500);
  });
});
