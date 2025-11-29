import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { Announcement, ANNOUNCEMENT_PRIORITIES } from '../../../src/models/announcement.models.js';

describe('Announcement Model', () => {
  describe('Schema and Model', () => {
    it('should have correct priority enum values', () => {
      expect(ANNOUNCEMENT_PRIORITIES).toEqual(['normal', 'high', 'urgent']);
      expect(Object.isFrozen(ANNOUNCEMENT_PRIORITIES)).toBe(true);
    });

    it('should create announcement with required fields', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };

      // Act
      const announcement = new Announcement(announcementData);

      // Assert
      expect(announcement.message).toBe('Test announcement');
      expect(announcement.priority).toBe('normal'); // default value
      expect(announcement.expiresAt).toBeNull(); // default value
      expect(announcement.createdByName).toBe('Test User');
      expect(announcement).toHaveProperty('createdAt');
      expect(announcement).toHaveProperty('updatedAt');
    });

    it('should trim message and createdByName', async () => {
      // Arrange
      const announcementData = {
        message: '  Test announcement  ',
        createdByName: '  Test User  '
      };

      // Act
      const announcement = new Announcement(announcementData);
      await announcement.validate(); // Trigger validation to apply trim

      // Assert
      expect(announcement.message).toBe('Test announcement');
      expect(announcement.createdByName).toBe('Test User');
    });

    it('should validate message is required', async () => {
      // Arrange
      const announcementData = {
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).rejects.toThrow(/message/);
    });

    it('should validate message max length', async () => {
      // Arrange
      const longMessage = 'A'.repeat(1001);
      const announcementData = {
        message: longMessage,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      // Updated to match the actual error message
      await expect(announcement.validate()).rejects.toThrow(/is longer than the maximum allowed length/);
    });

    it('should validate priority enum values', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        priority: 'invalid-priority',
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).rejects.toThrow(/`invalid-priority` is not a valid enum/);
    });

    it('should accept all valid priority values', async () => {
      // Arrange & Act & Assert
      for (const priority of ANNOUNCEMENT_PRIORITIES) {
        const announcementData = {
          message: 'Test announcement',
          priority: priority,
          createdBy: new mongoose.Types.ObjectId(),
          createdByName: 'Test User'
        };
        const announcement = new Announcement(announcementData);
        
        await expect(announcement.validate()).resolves.not.toThrow();
        expect(announcement.priority).toBe(priority);
      }
    });

    it('should set default priority to normal', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };

      // Act
      const announcement = new Announcement(announcementData);

      // Assert
      expect(announcement.priority).toBe('normal');
    });
  });

  describe('Virtual Properties', () => {
  it('should return false for isExpired when expiresAt is null', () => {
    // Arrange
    const announcement = new Announcement({
      message: 'Test announcement',
      expiresAt: null
    });

    // Act & Assert
    expect(announcement.isExpired).toBe(false);
  });

  it('should return false for isExpired when expiresAt is in the future', () => {
    // Arrange
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const announcement = new Announcement({
      message: 'Test announcement',
      expiresAt: futureDate
    });

    // Act & Assert
    expect(announcement.isExpired).toBe(false);
  });

  it('should return true for isExpired when expiresAt is in the past', () => {
    // Arrange
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    const announcement = new Announcement({
      message: 'Test announcement',
      expiresAt: pastDate
    });

    // Act & Assert
    expect(announcement.isExpired).toBe(true);
  });

  it('should handle isExpired with time slightly in the past', () => {
    // Arrange
    const slightlyPastTime = new Date(Date.now() - 1); // 1ms in the past
    const announcement = new Announcement({
      message: 'Test announcement',
      expiresAt: slightlyPastTime
    });

    // Act & Assert
    expect(announcement.isExpired).toBe(true);
  });

  it('should handle isExpired with time slightly in the future', () => {
    // Arrange
    const slightlyFutureTime = new Date(Date.now() + 1); // 1ms in the future
    const announcement = new Announcement({
      message: 'Test announcement',
      expiresAt: slightlyFutureTime
    });

    // Act & Assert
    expect(announcement.isExpired).toBe(false);
  });
});

  describe('Indexes', () => {
    it('should have priority index', () => {
      // Arrange
      const schema = Announcement.schema;

      // Act
      const priorityIndex = schema.indexes().find(index => 
        index[0] && index[0].priority === 1
      );

      // Assert
      expect(priorityIndex).toBeDefined();
    });

    it('should have expiresAt partial index', () => {
      // Arrange
      const schema = Announcement.schema;

      // Act
      const expiresAtIndex = schema.indexes().find(index => 
        index[0] && index[0].expiresAt === 1
      );

      // Assert
      expect(expiresAtIndex).toBeDefined();
      expect(expiresAtIndex[1]).toHaveProperty('partialFilterExpression');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long but valid message', async () => {
      // Arrange
      const maxLengthMessage = 'A'.repeat(1000);
      const announcementData = {
        message: maxLengthMessage,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.message).toBe(maxLengthMessage);
    });

    it('should handle empty createdByName', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: ''
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.createdByName).toBe('');
    });

    it('should handle null createdByName', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: null
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.createdByName).toBeNull();
    });

    it('should handle undefined createdByName', async () => {
      // Arrange
      const announcementData = {
        message: 'Test announcement',
        createdBy: new mongoose.Types.ObjectId()
        // createdByName is undefined
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.createdByName).toBeUndefined();
    });

    it('should handle valid date for expiresAt', async () => {
      // Arrange
      const validDate = new Date('2024-12-31T23:59:59.999Z');
      const announcementData = {
        message: 'Test announcement',
        expiresAt: validDate,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.expiresAt).toEqual(validDate);
    });

    it('should handle string date for expiresAt', async () => {
      // Arrange
      const dateString = '2024-12-31T23:59:59.999Z';
      const announcementData = {
        message: 'Test announcement',
        expiresAt: dateString,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).resolves.not.toThrow();
      expect(announcement.expiresAt).toBeInstanceOf(Date);
    });

    it('should reject invalid date string for expiresAt', async () => {
      // Arrange
      const invalidDateString = 'invalid-date-string';
      const announcementData = {
        message: 'Test announcement',
        expiresAt: invalidDateString,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'Test User'
      };
      const announcement = new Announcement(announcementData);

      // Act & Assert
      await expect(announcement.validate()).rejects.toThrow(/Cast to date failed/);
    });
  });
});
