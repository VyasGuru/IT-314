import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../../../src/controllers/announcement.controller.js';
import { createAnnouncementEntry, fetchAnnouncements, removeAnnouncement } from '../../../src/services/announcement.service.js';

// Mock the services
vi.mock('../../../src/services/announcement.service.js');

// Mock ApiResponse as a class
vi.mock('../../../src/utils/ApiResponse.js', () => ({
  ApiResponse: class {
    constructor(status, data, message) {
      this.status = status;
      this.data = data;
      this.message = message;
    }
  }
}));

// Mock ApiError as a class
vi.mock('../../../src/utils/ApiError.js', () => ({
  ApiError: class {
    constructor(status, message) {
      this.statusCode = status;
      this.message = message;
      this.isOperational = true;
    }
  }
}));

// Mock asyncHandler to properly handle errors
vi.mock('../../../src/utils/asyncHandler.js', () => ({
  asyncHandler: (fn) => async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      throw error;
    }
  }
}));

describe('Announcement Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
  });

  describe('createAnnouncement', () => {
    it('should create announcement successfully with valid data', async () => {
      // Arrange
      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement',
        expiresAt: '2024-12-31',
        priority: 'high',
        createdBy: 'user123',
        createdByName: 'John Doe'
      };

      mockReq.body = {
        message: 'Test announcement',
        expiresAt: '2024-12-31',
        priority: 'high'
      };
      mockReq.user = {
        _id: 'user123',
        name: 'John Doe'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith({
        message: 'Test announcement',
        expiresAt: '2024-12-31',
        priority: 'high',
        createdBy: 'user123',
        createdByName: 'John Doe'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle empty message validation from service layer', async () => {
      // Arrange
      mockReq.body = {
        message: '   ', // whitespace only
        expiresAt: '2024-12-31',
        priority: 'high'
      };
      mockReq.user = { _id: 'user123' };

      const apiError = { statusCode: 400, message: "Message is required", isOperational: true };
      createAnnouncementEntry.mockRejectedValue(apiError);

      // Act & Assert
      await expect(createAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle missing message validation from service layer', async () => {
      // Arrange
      mockReq.body = {
        expiresAt: '2024-12-31',
        priority: 'high'
      };
      mockReq.user = { _id: 'user123' };

      const apiError = { statusCode: 400, message: "Message is required", isOperational: true };
      createAnnouncementEntry.mockRejectedValue(apiError);

      // Act & Assert
      await expect(createAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle invalid priority validation from service layer', async () => {
      // Arrange
      mockReq.body = {
        message: 'Test announcement',
        expiresAt: '2024-12-31',
        priority: 'invalid-priority'
      };
      mockReq.user = { _id: 'user123' };

      const apiError = { 
        statusCode: 400, 
        message: "Invalid priority. Use: normal, high, or urgent", 
        isOperational: true 
      };
      createAnnouncementEntry.mockRejectedValue(apiError);

      // Act & Assert
      await expect(createAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle invalid date format validation from service layer', async () => {
      // Arrange
      mockReq.body = {
        message: 'Test announcement',
        expiresAt: 'invalid-date',
        priority: 'high'
      };
      mockReq.user = { _id: 'user123' };

      const apiError = { statusCode: 400, message: "Invalid expiresAt value", isOperational: true };
      createAnnouncementEntry.mockRejectedValue(apiError);

      // Act & Assert
      await expect(createAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle optional fields correctly', async () => {
      // Arrange
      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'John Doe'
      };

      mockReq.body = {
        message: 'Test announcement'
      };
      mockReq.user = {
        _id: 'user123',
        name: 'John Doe'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith({
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'John Doe'
      });
    });

    it('should use username when name is not available', async () => {
      // Arrange
      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'johndoe'
      };

      mockReq.body = {
        message: 'Test announcement'
      };
      mockReq.user = {
        _id: 'user123',
        username: 'johndoe'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith({
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'johndoe'
      });
    });

    it('should use "Admin" when neither name nor username is available', async () => {
      // Arrange
      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'Admin'
      };

      mockReq.body = {
        message: 'Test announcement'
      };
      mockReq.user = {
        _id: 'user123'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith({
        message: 'Test announcement',
        createdBy: 'user123',
        createdByName: 'Admin'
      });
    });

    it('should handle very long message input', async () => {
      // Arrange
      const longMessage = 'A'.repeat(10000);
      const mockAnnouncement = {
        _id: '123',
        message: longMessage
      };

      mockReq.body = {
        message: longMessage,
        expiresAt: '2024-12-31',
        priority: 'high'
      };
      mockReq.user = { _id: 'user123' };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          message: longMessage
        })
      );
    });

    it('should handle special characters in message', async () => {
      // Arrange
      const specialMessage = 'Announcement with <script>alert("xss")</script> & special chars';
      const mockAnnouncement = {
        _id: '123',
        message: specialMessage
      };

      mockReq.body = {
        message: specialMessage
      };
      mockReq.user = { _id: 'user123' };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert
      expect(createAnnouncementEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          message: specialMessage
        })
      );
    });

    it('should handle database failure during creation', async () => {
      // Arrange
      mockReq.body = {
        message: 'Test announcement',
        expiresAt: '2024-12-31',
        priority: 'high'
      };
      mockReq.user = { _id: 'user123' };

      const dbError = new Error('Database connection failed');
      createAnnouncementEntry.mockRejectedValue(dbError);

      // Act & Assert
      await expect(createAnnouncement(mockReq, mockRes)).rejects.toThrow('Database connection failed');
    });

    it('should handle missing user object', async () => {
      // Arrange
      mockReq.body = {
        message: 'Test announcement'
      };
      mockReq.user = undefined;

      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert - Should use "Admin" as fallback
      expect(createAnnouncementEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          createdByName: 'Admin'
        })
      );
    });

    it('should handle missing user ID', async () => {
      // Arrange
      mockReq.body = {
        message: 'Test announcement'
      };
      mockReq.user = {
        name: 'John Doe'
        // Missing _id
      };

      const mockAnnouncement = {
        _id: '123',
        message: 'Test announcement'
      };

      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act
      await createAnnouncement(mockReq, mockRes);

      // Assert - Should still call service with undefined createdBy
      expect(createAnnouncementEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: undefined,
          createdByName: 'John Doe'
        })
      );
    });
  });

  describe('getAnnouncements', () => {
    it('should fetch announcements successfully', async () => {
      // Arrange
      const mockData = {
        announcements: [{ _id: '1', message: 'Test' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      mockReq.query = { page: '1', limit: '10' };
      fetchAnnouncements.mockResolvedValue(mockData);

      // Act
      await getAnnouncements(mockReq, mockRes);

      // Assert
      expect(fetchAnnouncements).toHaveBeenCalledWith({ page: '1', limit: '10' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle empty query parameters', async () => {
      // Arrange
      const mockData = {
        announcements: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        }
      };

      mockReq.query = {};
      fetchAnnouncements.mockResolvedValue(mockData);

      // Act
      await getAnnouncements(mockReq, mockRes);

      // Assert
      expect(fetchAnnouncements).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle invalid query parameters', async () => {
      // Arrange
      const mockData = {
        announcements: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        }
      };

      mockReq.query = {
        page: 'invalid',
        limit: 'not-a-number'
      };
      fetchAnnouncements.mockResolvedValue(mockData);

      // Act
      await getAnnouncements(mockReq, mockRes);

      // Assert
      expect(fetchAnnouncements).toHaveBeenCalledWith({
        page: 'invalid',
        limit: 'not-a-number'
      });
    });

    it('should handle very large limit parameter', async () => {
      // Arrange
      const mockData = {
        announcements: [],
        pagination: {
          page: 1,
          limit: 50, // Service caps at 50
          total: 0,
          totalPages: 1
        }
      };

      mockReq.query = {
        limit: '1000000'
      };
      fetchAnnouncements.mockResolvedValue(mockData);

      // Act
      await getAnnouncements(mockReq, mockRes);

      // Assert
      expect(fetchAnnouncements).toHaveBeenCalledWith({
        limit: '1000000'
      });
    });

    it('should handle database failure during fetch', async () => {
      // Arrange
      mockReq.query = { page: '1' };
      const dbError = new Error('Database query failed');
      fetchAnnouncements.mockRejectedValue(dbError);

      // Act & Assert
      await expect(getAnnouncements(mockReq, mockRes)).rejects.toThrow('Database query failed');
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete announcement successfully', async () => {
      // Arrange
      const mockDeleted = { _id: '123' };
      mockReq.params = { id: '123' };
      removeAnnouncement.mockResolvedValue(mockDeleted);

      // Act
      await deleteAnnouncement(mockReq, mockRes);

      // Assert
      expect(removeAnnouncement).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle non-existent announcement ID', async () => {
      // Arrange
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      const apiError = { statusCode: 404, message: "Announcement not found", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle invalid announcement ID format', async () => {
      // Arrange
      mockReq.params = { id: 'invalid-id-format' };
      const apiError = { statusCode: 400, message: "Invalid announcement id", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle database failure during deletion', async () => {
      // Arrange
      mockReq.params = { id: '123' };
      const dbError = new Error('Database deletion failed');
      removeAnnouncement.mockRejectedValue(dbError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toThrow('Database deletion failed');
    });

    it('should handle whitespace in announcement ID', async () => {
      // Arrange
      mockReq.params = { id: '  123  ' };
      const apiError = { statusCode: 400, message: "Invalid announcement id", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle SQL injection-like patterns in ID', async () => {
      // Arrange
      mockReq.params = { id: "123'; DROP TABLE announcements; --" };
      const apiError = { statusCode: 400, message: "Invalid announcement id", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle very long announcement ID', async () => {
      // Arrange
      const longId = 'a'.repeat(1000);
      mockReq.params = { id: longId };
      const apiError = { statusCode: 400, message: "Invalid announcement id", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });

    it('should handle empty announcement ID', async () => {
      // Arrange
      mockReq.params = { id: '' };
      const apiError = { statusCode: 400, message: "Invalid announcement id", isOperational: true };
      removeAnnouncement.mockRejectedValue(apiError);

      // Act & Assert
      await expect(deleteAnnouncement(mockReq, mockRes)).rejects.toEqual(apiError);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid consecutive create requests', async () => {
      // Arrange
      const mockAnnouncement = { _id: '123', message: 'Test' };
      mockReq.body = { message: 'Test announcement' };
      mockReq.user = { _id: 'user123', name: 'John Doe' };
      
      createAnnouncementEntry.mockResolvedValue(mockAnnouncement);

      // Act - Simulate concurrent requests
      const promises = [
        createAnnouncement(mockReq, mockRes),
        createAnnouncement(mockReq, mockRes),
        createAnnouncement(mockReq, mockRes)
      ];

      // Assert
      await expect(Promise.all(promises)).resolves.toBeDefined();
      expect(createAnnouncementEntry).toHaveBeenCalledTimes(3);
    });
  });
});
