import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Chatbot Controller', () => {
  let mockReq, mockRes;
  let ChatMessage;
  let echoChatHandler, getChatHistory, clearChatHistory;
  let mockGroqCreate;

  // Create the crypto mock UUID function at the top level
  const mockRandomUUID = vi.fn(() => 'mocked-uuid-123');

  beforeEach(async () => {
    // Clear all mocks and modules
    vi.clearAllMocks();
    vi.resetModules();

    // Setup environment
    process.env.GROQ_API_KEY = 'test-api-key';
    process.env.GROQ_MODEL = 'test-model';
    process.env.GROQ_TEMPERATURE = '0.5';
    process.env.GROQ_MAX_TOKENS = '512';

    // Setup request/response mocks
    mockReq = {
      body: {},
      params: {},
      ip: '127.0.0.1',
      get: vi.fn(() => 'test-user-agent')
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    // FIX: Mock crypto with proper default export
    vi.doMock('crypto', () => ({
      default: {
        randomUUID: mockRandomUUID
      },
      randomUUID: mockRandomUUID
    }));

    // Mock ChatMessage model
    vi.doMock('../src/models/chatMessage.models.js', () => ({
      ChatMessage: {
        create: vi.fn(),
        find: vi.fn(() => ({
          sort: vi.fn(() => ({
            lean: vi.fn()
          }))
        })),
        deleteMany: vi.fn()
      }
    }));

    // Mock utilities
    vi.doMock('../src/utils/asyncHandler.js', () => ({
      asyncHandler: (fn) => fn
    }));

    vi.doMock('../src/utils/ApiError.js', () => ({
      ApiError: class ApiError extends Error {
        constructor(statusCode, message, errors = []) {
          super(message);
          this.statusCode = statusCode;
          this.errors = errors;
        }
      }
    }));

    vi.doMock('../src/utils/ApiResponse.js', () => ({
      ApiResponse: class ApiResponse {
        constructor(statusCode, data, message = "Success") {
          this.statusCode = statusCode;
          this.data = data;
          this.message = message;
          this.success = statusCode < 400;
        }
      }
    }));

    // Create a mock function for the Groq API call
    mockGroqCreate = vi.fn();

    // Mock Groq as a proper class with our mock function
    vi.doMock('groq-sdk', () => {
      return {
        default: class MockGroq {
          constructor() {
            this.chat = {
              completions: {
                create: mockGroqCreate // Use the shared mock function
              }
            };
          }
        }
      };
    });

    // Reset the UUID mock to return our expected value
    mockRandomUUID.mockReturnValue('mocked-uuid-123');

    // Now dynamically import the controller and models
    const ChatMessageModule = await import('../src/models/chatMessage.models.js');
    const ControllerModule = await import('../src/controllers/chatbot.controller.js');
    
    ChatMessage = ChatMessageModule.ChatMessage;
    echoChatHandler = ControllerModule.echoChatHandler;
    getChatHistory = ControllerModule.getChatHistory;
    clearChatHistory = ControllerModule.clearChatHistory;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('echoChatHandler', () => {
    it('should successfully process a valid chat message', async () => {
      // Setup - mock a successful Groq response
      const mockCompletion = {
        choices: [{
          message: { 
            content: 'Test reply from AI with proper response' 
          }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello, how are you?',
        sessionId: 'session123'
      };

      await echoChatHandler(mockReq, mockRes);

      // Verify the response
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply from AI with proper response',
        sessionId: 'session123',
        historyId: 'history123'
      });
    });

    it('should generate sessionId when not provided', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply with generated session' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      // Set the specific UUID we expect for this test
      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello'
        // No sessionId provided
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply with generated session',
        sessionId: 'mocked-uuid-123', // Should use the mocked UUID
        historyId: 'history123'
      });
    });

    it('should handle sessionId with only whitespace', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      // Set the specific UUID we expect for this test
      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello',
        sessionId: '   ' // Only whitespace
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply',
        sessionId: 'mocked-uuid-123', // Should generate new UUID
        historyId: 'history123'
      });
    });

   it('should successfully process a valid chat message', async () => {
      // Setup - mock a successful Groq response
      const mockCompletion = {
        choices: [{
          message: { 
            content: 'Test reply from AI with proper response' 
          }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello, how are you?',
        sessionId: 'session123'
      };

      await echoChatHandler(mockReq, mockRes);

      // Verify the response
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply from AI with proper response',
        sessionId: 'session123',
        historyId: 'history123'
      });

      // Verify Groq was called with correct parameters
      expect(mockGroqCreate).toHaveBeenCalledWith({
        model: 'test-model',
        messages: [
          { role: "system", content: expect.any(String) },
          { role: "user", content: 'Hello, how are you?' }
        ],
        temperature: 0.5,
        max_tokens: 512
      });
    });

    it('should handle Groq API returning empty response', async () => {
      // Setup - mock empty response from Groq
      const mockCompletion = {
        choices: [{
          message: { content: '' } // Empty content
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Unable to get response from Echo');
    });

    it('should handle Groq API returning no choices', async () => {
      // Setup - mock no choices from Groq
      const mockCompletion = {
        choices: [] // No choices
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Unable to get response from Echo');
    });

    it('should handle Groq API failure', async () => {
      // Setup - mock API failure
      mockGroqCreate.mockRejectedValue(new Error('API timeout'));

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Unable to get response from Echo');
    });

    it('should handle database save failure gracefully', async () => {
      // Setup - successful Groq response but DB failure
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply despite DB failure' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockRejectedValue(new Error('DB connection failed'));

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await echoChatHandler(mockReq, mockRes);

      // Should still succeed but with null historyId
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply despite DB failure',
        sessionId: 'session123',
        historyId: null
      });
    });

    it('should generate sessionId when not provided', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply with generated session' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      // Set the specific UUID we expect for this test
      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello'
        // No sessionId provided
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply with generated session',
        sessionId: 'mocked-uuid-123', // Should use the mocked UUID
        historyId: 'history123'
      });
    });

    it('should trim message whitespace', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: '   Hello with spaces   ',
        sessionId: 'session123'
      };

      await echoChatHandler(mockReq, mockRes);

      // Verify trimmed message was sent to Groq
      expect(mockGroqCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'Hello with spaces' }
          ])
        })
      );
    });

    it('should throw error when message is missing', async () => {
      mockReq.body = {
        sessionId: 'session123'
        // No message
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Message text is required');
    });

    it('should throw error when GROQ_API_KEY is missing', async () => {
      delete process.env.GROQ_API_KEY;

      // Re-import the controller with the missing API key
      vi.resetModules();
      const ControllerModule = await import('../src/controllers/chatbot.controller.js');
      const handlerWithNoKey = ControllerModule.echoChatHandler;

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(handlerWithNoKey(mockReq, mockRes))
        .rejects
        .toThrow('GROQ API key is not configured on the server');
    });

    it('should handle sessionId with only whitespace', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: 'Test reply' }
        }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      // Set the specific UUID we expect for this test
      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello',
        sessionId: '   ' // Only whitespace
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply',
        sessionId: 'mocked-uuid-123', // Should generate new UUID
        historyId: 'history123'
      });
    });
  });

  describe('getChatHistory', () => {
    it('should successfully fetch chat history', async () => {
      const mockRecords = [
        { userMessage: 'Hello', botReply: 'Hi there', createdAt: new Date() }
      ];

      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockRecords)
        })
      });

      mockReq.params = { sessionId: 'session123' };

      await getChatHistory(mockReq, mockRes);

      expect(ChatMessage.find).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockRecords,
          message: 'Chat history fetched successfully'
        })
      );
    });

    it('should return empty array when no history found', async () => {
      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([])
        })
      });

      mockReq.params = { sessionId: 'nonexistent' };

      await getChatHistory(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: []
        })
      );
    });

    it('should throw error when sessionId is missing', async () => {
      mockReq.params = {};

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should throw error when sessionId is only whitespace', async () => {
      mockReq.params = { sessionId: '   ' };

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });
  });

  describe('clearChatHistory', () => {
    it('should successfully clear chat history', async () => {
      ChatMessage.deleteMany.mockResolvedValue({ deletedCount: 5 });

      mockReq.params = { sessionId: 'session123' };

      await clearChatHistory(mockReq, mockRes);

      expect(ChatMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Chat history cleared successfully'
        })
      );
    });

    it('should succeed even when no records to delete', async () => {
      ChatMessage.deleteMany.mockResolvedValue({ deletedCount: 0 });

      mockReq.params = { sessionId: 'nonexistent' };

      await clearChatHistory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should throw error when sessionId is missing', async () => {
      mockReq.params = {};

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should throw error when sessionId is only whitespace', async () => {
      mockReq.params = { sessionId: '   ' };

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });
  });
});
