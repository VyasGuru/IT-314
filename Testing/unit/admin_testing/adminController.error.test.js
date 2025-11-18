// tests/Unit/AdminController/adminController.error.test.js

import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';

// Force an error by breaking built-in methods
describe('adminController.cleanupAbusiveReviews - error path', () => {
  let req, res;
  let adminModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    adminModule = await import('../../../src/controllers/adminController.js');
    
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should cover error lines by breaking console.log', () => {
    // Make the first console.log throw an error to trigger the catch block
    let callCount = 0;
    console.log.mockImplementation(() => {
      callCount++;
      if (callCount === 1) { // Only break the first console.log call
        throw new Error('Console broken');
      }
    });

    adminModule.cleanupAbusiveReviews(req, res);

    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
  });

  test('should cover error lines by breaking filter operation', () => {
    // Temporarily break the filter method on arrays
    const originalFilter = Array.prototype.filter;
    
    Array.prototype.filter = function() {
      throw new Error('Filter operation failed');
    };

    try {
      adminModule.cleanupAbusiveReviews(req, res);
    } finally {
      Array.prototype.filter = originalFilter;
    }

    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
  });
});
