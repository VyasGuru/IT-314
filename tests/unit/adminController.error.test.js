/**
 * adminController.error.test.js (ESM compatible)
 */

describe("adminController.cleanupAbusiveReviews - error path", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetModules();
    });
  
    test('should return 500 and "Server Error" when an internal error occurs', async () => {
      // suppress console output
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
  
      // mock filter() to throw an error
      const originalFilter = Array.prototype.filter;
      const mockFilter = jest.fn(() => {
        throw new Error("simulated failure");
      });
      Array.prototype.filter = mockFilter;
  
      // import controller dynamically for ESM
      const controller = await import("../../src/controllers/adminController.js");
      const { cleanupAbusiveReviews } = controller;
  
      // mock req/res
      const req = {};
      const res = {
        statusCode: null,
        jsonData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.jsonData = data;
          return this;
        },
      };
  
      jest.spyOn(res, "status");
      jest.spyOn(res, "json");
  
      try {
        cleanupAbusiveReviews(req, res);
      } finally {
        // always restore
        Array.prototype.filter = originalFilter;
      }
  
      // expectations
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.statusCode).toBe(500);
  
      expect(res.json).toHaveBeenCalledWith({ message: "Server Error" });
      expect(res.jsonData).toEqual({ message: "Server Error" });
  
      expect(mockFilter).toHaveBeenCalled();
    });
  });
  