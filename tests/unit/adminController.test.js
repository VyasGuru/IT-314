import httpMocks from "node-mocks-http";
import { cleanupAbusiveReviews } from "../../src/controllers/adminController.js";

describe("adminController.cleanupAbusiveReviews", () => {
  test("should return 200 and updated review list", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await cleanupAbusiveReviews(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty("message");
  });
});
