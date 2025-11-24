import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  registerAdmin, 
  loginAdmin, 
  classifySingleReview, 
  listReviews, 
  deleteReviewById, 
  deleteAllAbusive 
} from '../../../src/controllers/adminController.js';
import { classifyReviewWithLLM } from '../../../src/controllers/moderationService.js';
import { Review } from '../../../src/models/review.models.js';
import { Admin } from '../../../src/models/admin.models.js';

// Mock dependencies
vi.mock('../../../src/controllers/moderationService.js');
vi.mock('../../../src/models/review.models.js');
vi.mock('../../../src/models/admin.models.js');

describe('Admin Controller Tests', () => {
  let mockReq, mockRes;
  let mockSave;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    
    // Create a proper mock for Review constructor
    mockSave = vi.fn();
    
    // Mock Review as a class with proper constructor
    Review.mockImplementation(function(data) {
      this.data = data;
      this.save = mockSave;
      return this;
    });
    
    vi.clearAllMocks();
  });

  describe('registerAdmin', () => {
    it('should return 500 - not implemented', async () => {
      await registerAdmin(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'This feature is not implemented yet.' 
      });
    });
  });

  describe('loginAdmin', () => {
    it('should return 500 - not implemented', async () => {
      await loginAdmin(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'This feature is not implemented yet.' 
      });
    });
  });

  describe('classifySingleReview', () => {
    it('should successfully classify and save review', async () => {
      const mockReviewData = {
        comment: 'This is a great product!',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123',
        rating: 5
      };
      
      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReviewData,
        isAbusive: false
      };

      mockReq.body = mockReviewData;
      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(classifyReviewWithLLM).toHaveBeenCalledWith('This is a great product!');
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      
      // Check response structure
      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Review saved');
      expect(responseCall.moderation).toEqual(mockModerationResult);
      expect(responseCall.review).toEqual(mockSavedReview);
    });

    it('should handle missing comment', async () => {
      mockReq.body = {
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Comment required'
      });
    });

    it('should handle missing required fields', async () => {
      const testCases = [
        { body: { comment: 'test' } },
        { body: { comment: 'test', targetType: 'product' } },
        { body: { comment: 'test', targetId: '123' } },
        { body: { comment: 'test', reviewerFirebaseUid: 'uid123' } }
      ];

      for (const testCase of testCases) {
        mockReq.body = testCase.body;
        await classifySingleReview(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'targetType, targetId, reviewerFirebaseUid required'
        });
      }
    });

    it('should handle whitespace-only comment', async () => {
      mockReq.body = {
        comment: '   ',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      await classifySingleReview(mockReq, mockRes);

      // This will likely fail until you add proper whitespace validation
      // Let's check what actually happens
      const statusCall = mockRes.status.mock.calls[0]?.[0];
      
      if (statusCall === 400) {
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'Comment required'
        });
      } else {
        // If it's not 400, the test will fail but we know why
        expect(mockRes.status).toHaveBeenCalledWith(400);
      }
    });

    it('should handle empty string comment', async () => {
      mockReq.body = {
        comment: '',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Comment required'
      });
    });

    it('should handle null comment', async () => {
      mockReq.body = {
        comment: null,
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Comment required'
      });
    });

    it('should use default rating when not provided', async () => {
      mockReq.body = {
        comment: 'Good product',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
        // rating not provided
      };

      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReq.body,
        rating: 5,
        isAbusive: false
      };

      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
      
      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Review saved');
      expect(responseCall.moderation).toEqual(mockModerationResult);
    });

    it('should handle moderation service failure', async () => {
      mockReq.body = {
        comment: 'Test comment',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      classifyReviewWithLLM.mockRejectedValue(new Error('Moderation service down'));

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error processing review',
        error: 'Moderation service down'
      });
    });

    it('should handle database save failure', async () => {
      mockReq.body = {
        comment: 'Test comment',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      const mockModerationResult = { isAbusive: false };
      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockRejectedValue(new Error('Database connection failed'));

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error processing review',
        error: 'Database connection failed'
      });
    });

    it('should handle malformed JSON in request', async () => {
      mockReq.body = undefined;

      await classifySingleReview(mockReq, mockRes);

      // This should result in a 500 error due to destructuring undefined
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle very long comment', async () => {
      const longComment = 'a'.repeat(10000);
      mockReq.body = {
        comment: longComment,
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReq.body,
        isAbusive: false
      };

      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(classifyReviewWithLLM).toHaveBeenCalledWith(longComment);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('listReviews', () => {
    it('should return all reviews successfully', async () => {
      const mockReviews = [
        { _id: '1', comment: 'Good', targetType: 'product' },
        { _id: '2', comment: 'Bad', targetType: 'service' }
      ];

      Review.find.mockResolvedValue(mockReviews);

      await listReviews(mockReq, mockRes);

      expect(Review.find).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 2,
        reviews: mockReviews
      });
    });

    it('should handle empty reviews list', async () => {
      Review.find.mockResolvedValue([]);

      await listReviews(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        count: 0,
        reviews: []
      });
    });

    it('should handle database query failure', async () => {
      Review.find.mockRejectedValue(new Error('Database error'));

      await listReviews(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error fetching reviews',
        error: 'Database error'
      });
    });
  });

  describe('deleteReviewById', () => {
    it('should delete review successfully', async () => {
      mockReq.params = { id: 'review123' };
      const mockDeletedReview = { _id: 'review123', comment: 'Test review' };

      Review.findByIdAndDelete.mockResolvedValue(mockDeletedReview);

      await deleteReviewById(mockReq, mockRes);

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith('review123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Review deleted',
        id: 'review123'
      });
    });

    it('should handle non-existent review', async () => {
      mockReq.params = { id: 'nonexistent' };
      Review.findByIdAndDelete.mockResolvedValue(null);

      await deleteReviewById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Review not found'
      });
    });

    it('should handle invalid ID format', async () => {
      mockReq.params = { id: 'invalid-id-format' };
      Review.findByIdAndDelete.mockResolvedValue(null);

      await deleteReviewById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Review not found'
      });
    });

    it('should handle database deletion failure', async () => {
      mockReq.params = { id: 'review123' };
      Review.findByIdAndDelete.mockRejectedValue(new Error('Database connection failed'));

      await deleteReviewById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error deleting review',
        error: 'Database connection failed'
      });
    });

    it('should handle missing ID parameter', async () => {
      mockReq.params = {};

      await deleteReviewById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteAllAbusive', () => {
    it('should delete all abusive reviews successfully', async () => {
      const mockResult = { deletedCount: 5 };
      Review.deleteMany.mockResolvedValue(mockResult);

      await deleteAllAbusive(mockReq, mockRes);

      expect(Review.deleteMany).toHaveBeenCalledWith({ isAbusive: true });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Abusive reviews deleted',
        deleted: 5
      });
    });

    it('should handle no abusive reviews found', async () => {
      const mockResult = { deletedCount: 0 };
      Review.deleteMany.mockResolvedValue(mockResult);

      await deleteAllAbusive(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Abusive reviews deleted',
        deleted: 0
      });
    });

    it('should handle database deletion failure', async () => {
      Review.deleteMany.mockRejectedValue(new Error('Database error'));

      await deleteAllAbusive(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error deleting reviews',
        error: 'Database error'
      });
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle special characters in comment', async () => {
      mockReq.body = {
        comment: 'Special chars: ñáéíóú 中文 🚀',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123'
      };

      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReq.body,
        isAbusive: false
      };

      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(classifyReviewWithLLM).toHaveBeenCalledWith('Special chars: ñáéíóú 中文 🚀');
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle SQL injection attempts in fields', async () => {
      mockReq.body = {
        comment: 'Test',
        targetType: "product'; DROP TABLE reviews; --",
        targetId: "123'; DELETE FROM reviews; --",
        reviewerFirebaseUid: "uid123'; DROP TABLE users; --"
      };

      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReq.body,
        isAbusive: false
      };

      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle extremely large numeric rating', async () => {
      mockReq.body = {
        comment: 'Test',
        targetType: 'product',
        targetId: '123',
        reviewerFirebaseUid: 'uid123',
        rating: 9999999999
      };

      const mockModerationResult = { isAbusive: false };
      const mockSavedReview = {
        _id: 'review123',
        ...mockReq.body,
        isAbusive: false
      };

      classifyReviewWithLLM.mockResolvedValue(mockModerationResult);
      mockSave.mockResolvedValue(mockSavedReview);

      await classifySingleReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
