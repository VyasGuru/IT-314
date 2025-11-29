import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyReviewWithLLM } from '../../../src/controllers/moderationService.js';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

describe('classifyReviewWithLLM', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Test Case 1: Successful classification - abusive content
  it('should correctly classify abusive review', async () => {
    // Setup
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": true, "category": "abusive", "reason": "Contains offensive language"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    // Execute
    const reviewText = "This place is terrible and the owner is an idiot!";
    const result = await classifyReviewWithLLM(reviewText);

    // Verify
    expect(fetch).toHaveBeenCalledWith(
      'https://api.groq.com/v1',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        }
      })
    );
    expect(result).toEqual({
      isAbusive: true,
      category: "abusive",
      reason: "Contains offensive language"
    });
  });

  // Test Case 2: Successful classification - safe content
  it('should correctly classify safe review', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Appropriate content"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Great location and friendly neighbors!";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result.isAbusive).toBe(false);
    expect(result.category).toBe("safe");
  });

  // Test Case 3: Missing API URL configuration
  it('should handle missing API URL configuration', async () => {
    delete process.env.GROQ_API_URL;
    delete process.env.LLM_API_URL;

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 4: Invalid LLM response format - missing candidates
  it('should handle invalid LLM response format (missing candidates)', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      // Missing candidates array
      error: "Something went wrong"
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 5: Invalid LLM response format - empty candidates
  it('should handle invalid LLM response format (empty candidates)', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [] // Empty candidates array
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 6: Invalid LLM response format - missing parts
  it('should handle invalid LLM response format (missing parts)', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          // Missing parts array
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 7: Invalid LLM response format - missing text
  it('should handle invalid LLM response format (missing text)', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{}] // Empty parts object
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 8: Invalid JSON in LLM response
  it('should handle invalid JSON in LLM response', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: 'Invalid JSON { isAbusive: true, category: "abusive" }' // Invalid JSON
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 9: Network failure
  it('should handle network failures', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    fetch.mockRejectedValue(new Error('Network error'));

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result).toEqual({
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    });
  });

  // Test Case 10: Fallback to LLM_API_KEY when GROQ_API_KEY is missing
  it('should use LLM_API_KEY when GROQ_API_KEY is not available', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    delete process.env.GROQ_API_KEY;
    process.env.LLM_API_KEY = 'fallback-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Appropriate"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Nice place!";
    await classifyReviewWithLLM(reviewText);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.groq.com/v1',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer fallback-key'
        })
      })
    );
  });

  // Test Case 11: Review text with special characters and escape sequences
  it('should handle review text with special characters', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Handled special chars"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = 'Review with "quotes", \nnewlines, and \\backslashes\\';
    const result = await classifyReviewWithLLM(reviewText);

    expect(result.isAbusive).toBe(false);
  });

  // Test Case 12: Empty review text
  it('should handle empty review text', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Empty review"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result.isAbusive).toBe(false);
  });

  // Test Case 13: Very long review text
  it('should handle very long review text', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Long but appropriate"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const longReview = "A".repeat(10000); // Very long review
    const result = await classifyReviewWithLLM(longReview);

    expect(result.isAbusive).toBe(false);
  });

  // Test Case 14: Review text with only whitespace
  it('should handle whitespace-only review text', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Whitespace only"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "   \n\t   ";
    const result = await classifyReviewWithLLM(reviewText);

    expect(result.isAbusive).toBe(false);
  });

  // Test Case 15: LLM returns unexpected category values
  it('should handle unexpected category values from LLM', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": true, "category": "unknown_category", "reason": "Some reason"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Bad review";
    const result = await classifyReviewWithLLM(reviewText);

    // Should still parse successfully even with unexpected category
    expect(result.isAbusive).toBe(true);
    expect(result.category).toBe("unknown_category");
  });

  // Test Case 16: Missing required fields in LLM response
  it('should handle missing required fields in LLM JSON response', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    process.env.GROQ_API_KEY = 'test-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": true}' // Missing category and reason
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    const result = await classifyReviewWithLLM(reviewText);

    // Should handle partial response
    expect(result.isAbusive).toBe(true);
    expect(result.category).toBeUndefined();
  });

  // Test Case 17: Using LLM_API_URL when GROQ_API_URL is not available
  it('should use LLM_API_URL when GROQ_API_URL is not available', async () => {
    delete process.env.GROQ_API_URL;
    process.env.LLM_API_URL = 'https://fallback-api.com/v1';
    process.env.LLM_API_KEY = 'fallback-key';
    
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "Fallback API"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    await classifyReviewWithLLM(reviewText);

    expect(fetch).toHaveBeenCalledWith(
      'https://fallback-api.com/v1',
      expect.anything()
    );
  });

  // Test Case 18: No API keys available
  it('should handle case when no API keys are available', async () => {
    process.env.GROQ_API_URL = 'https://api.groq.com/v1';
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_API_KEY;

    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"isAbusive": false, "category": "safe", "reason": "No auth"}'
          }]
        }
      }]
    };

    fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const reviewText = "Test review";
    await classifyReviewWithLLM(reviewText);

    // Should make request without Authorization header
    expect(fetch).toHaveBeenCalledWith(
      'https://api.groq.com/v1',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
          // No Authorization header
        })
      })
    );
  });
});
