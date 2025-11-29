import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Chatbot Controller', () => {
  let mockReq, mockRes;
  let ChatMessage;
  let echoChatHandler, getChatHistory, clearChatHistory;
  let mockGroqCreate;
  let ApiError;

  const mockRandomUUID = vi.fn(() => 'mocked-uuid-123');

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Setup environment
    process.env.GROQ_API_KEY = 'test-api-key';
    process.env.GROQ_MODEL = 'test-model';
    process.env.GROQ_TEMPERATURE = '0.5';
    process.env.GROQ_MAX_TOKENS = '512';
    process.env.GROQ_SYSTEM_PROMPT = 'Test system prompt';

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

    // Mock crypto
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

    // Mock Groq
    mockGroqCreate = vi.fn();
    vi.doMock('groq-sdk', () => {
      return {
        default: class MockGroq {
          constructor() {
            this.chat = {
              completions: {
                create: mockGroqCreate
              }
            };
          }
        }
      };
    });

    mockRandomUUID.mockReturnValue('mocked-uuid-123');

    // Import modules
    const ChatMessageModule = await import('../src/models/chatMessage.models.js');
    const ControllerModule = await import('../src/controllers/chatbot.controller.js');
    const ApiErrorModule = await import('../src/utils/ApiError.js');
    
    ChatMessage = ChatMessageModule.ChatMessage;
    echoChatHandler = ControllerModule.echoChatHandler;
    getChatHistory = ControllerModule.getChatHistory;
    clearChatHistory = ControllerModule.clearChatHistory;
    ApiError = ApiErrorModule.ApiError;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('echoChatHandler', () => {
    it('should successfully process a valid chat message', async () => {
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

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply from AI with proper response',
        sessionId: 'session123',
        historyId: 'history123'
      });

      expect(mockGroqCreate).toHaveBeenCalledWith({
        model: 'test-model',
        messages: [
          { role: "system", content: 'Test system prompt' },
          { role: "user", content: 'Hello, how are you?' }
        ],
        temperature: 0.5,
        max_tokens: 512
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

      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello'
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply with generated session',
        sessionId: 'mocked-uuid-123',
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

      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello',
        sessionId: '   '
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply',
        sessionId: 'mocked-uuid-123',
        historyId: 'history123'
      });
    });

    it('should handle Groq API returning empty response', async () => {
      const mockCompletion = {
        choices: [{
          message: { content: '' }
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

      expect(mockGroqCreate).toHaveBeenCalled();
    });

    it('should handle Groq API returning no choices', async () => {
      const mockCompletion = {
        choices: []
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
      const apiError = new Error('API timeout');
      apiError.message = 'API timeout message';
      mockGroqCreate.mockRejectedValue(apiError);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Unable to get response from Echo');
    });

    it('should handle Groq API failure with error that has no message property', async () => {
      const errorWithoutMessage = { name: 'Error' };
      mockGroqCreate.mockRejectedValue(errorWithoutMessage);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Unable to get response from Echo');
    });

    it('should handle database save failure gracefully', async () => {
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

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply despite DB failure',
        sessionId: 'session123',
        historyId: null
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
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Message text is required');
    });

    it('should throw error when message is empty string', async () => {
      mockReq.body = {
        message: '',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Message text is required');
    });

    it('should throw error when message is only whitespace', async () => {
      mockReq.body = {
        message: '   ',
        sessionId: 'session123'
      };

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Message text is required');
    });

    it('should throw error when GROQ_API_KEY is missing', async () => {
      delete process.env.GROQ_API_KEY;

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

    it('should use default model when GROQ_MODEL env var is not set', async () => {
      delete process.env.GROQ_MODEL;

      vi.resetModules();
      const ControllerModule = await import('../src/controllers/chatbot.controller.js');
      const handlerWithDefaults = ControllerModule.echoChatHandler;

      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await handlerWithDefaults(mockReq, mockRes);

      expect(mockGroqCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "llama-3.3-70b-versatile"
        })
      );
    });

    it('should use default temperature and max_tokens when env vars not set', async () => {
      delete process.env.GROQ_TEMPERATURE;
      delete process.env.GROQ_MAX_TOKENS;

      vi.resetModules();
      const ControllerModule = await import('../src/controllers/chatbot.controller.js');
      const handlerWithDefaults = ControllerModule.echoChatHandler;

      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await handlerWithDefaults(mockReq, mockRes);

      expect(mockGroqCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
          max_tokens: 512
        })
      );
    });

    it('should handle undefined request body gracefully', async () => {
      mockReq.body = undefined;

      await expect(echoChatHandler(mockReq, mockRes))
        .rejects
        .toThrow('Message text is required');
    });

    it('should use default system prompt when GROQ_SYSTEM_PROMPT is not set', async () => {
      delete process.env.GROQ_SYSTEM_PROMPT;

      vi.resetModules();
      const ControllerModule = await import('../src/controllers/chatbot.controller.js');
      const handlerWithDefaultPrompt = ControllerModule.echoChatHandler;

      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      await handlerWithDefaultPrompt(mockReq, mockRes);

      expect(mockGroqCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { 
              role: "system", 
              content: expect.stringContaining('You are Echo, a helpful chatbot')
            }
          ])
        })
      );
    });

    it('should handle specific error conditions in catch block with error message', async () => {
      const specificError = new Error('Network timeout');
      specificError.message = 'Specific error message';
      
      mockGroqCreate.mockRejectedValue(specificError);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      try {
        await echoChatHandler(mockReq, mockRes);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(502);
        expect(error.message).toBe('Unable to get response from Echo');
        expect(error.errors).toEqual(['Specific error message']);
      }
    });

    it('should handle specific error conditions in catch block without error message', async () => {
      const specificError = new Error('Network timeout');
      specificError.message = undefined;
      
      mockGroqCreate.mockRejectedValue(specificError);

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };

      try {
        await echoChatHandler(mockReq, mockRes);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(502);
        expect(error.message).toBe('Unable to get response from Echo');
        expect(error.errors).toBeUndefined();
      }
    });

    it('should handle very long session IDs', async () => {
      const longSessionId = 'a'.repeat(1000);
      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: longSessionId
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle special characters in session ID', async () => {
      const specialSessionId = 'session@#$%^&*()_+{}[]:;"\'<>,.?/';
      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: specialSessionId
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should store metadata even when IP is undefined', async () => {
      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };
      mockReq.ip = undefined;

      await echoChatHandler(mockReq, mockRes);

      expect(ChatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            ip: undefined,
            userAgent: 'test-user-agent'
          }
        })
      );
    });

    it('should store metadata even when userAgent is undefined', async () => {
      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockReq.body = {
        message: 'Hello',
        sessionId: 'session123'
      };
      mockReq.get.mockReturnValue(undefined);

      await echoChatHandler(mockReq, mockRes);

      expect(ChatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            ip: '127.0.0.1',
            userAgent: undefined
          }
        })
      );
    });

    it('should handle sessionId that is not a string', async () => {
      const mockCompletion = {
        choices: [{ message: { content: 'Test reply' } }]
      };

      mockGroqCreate.mockResolvedValue(mockCompletion);
      ChatMessage.create.mockResolvedValue({ _id: 'history123' });

      mockRandomUUID.mockReturnValue('mocked-uuid-123');

      mockReq.body = {
        message: 'Hello',
        sessionId: 12345 // number instead of string
      };

      await echoChatHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        reply: 'Test reply',
        sessionId: 'mocked-uuid-123',
        historyId: 'history123'
      });
    });

    it('should handle Groq client creation without apiKey', async () => {
      delete process.env.GROQ_API_KEY;

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

    it('should return empty array when no history found (non-existing sessionId)', async () => {
      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([])
        })
      });

      mockReq.params = { sessionId: 'nonexistent-session' };

      await getChatHistory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
          message: 'Chat history fetched successfully'
        })
      );
    });

    it('should handle huge chat history (large result set)', async () => {
      const hugeRecords = Array.from({ length: 1000 }, (_, i) => ({
        userMessage: `Message ${i}`,
        botReply: `Reply ${i}`,
        createdAt: new Date()
      }));

      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(hugeRecords)
        })
      });

      mockReq.params = { sessionId: 'session-with-huge-history' };

      await getChatHistory(mockReq, mockRes);

      expect(ChatMessage.find).toHaveBeenCalledWith({ sessionId: 'session-with-huge-history' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: hugeRecords,
          message: 'Chat history fetched successfully'
        })
      );
    });

    it('should handle null records from database', async () => {
      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null)
        })
      });

      mockReq.params = { sessionId: 'session123' };

      await getChatHistory(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: []
        })
      );
    });

    it('should handle undefined records from database', async () => {
      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(undefined)
        })
      });

      mockReq.params = { sessionId: 'session123' };

      await getChatHistory(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: []
        })
      );
    });

    it('should handle DB connectivity issues (ChatMessage.find throws)', async () => {
      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        })
      });

      mockReq.params = { sessionId: 'session123' };

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should throw error when sessionId is missing (undefined)', async () => {
      mockReq.params = {};

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should throw error when sessionId is null', async () => {
      mockReq.params = { sessionId: null };

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

    it('should throw error when sessionId is empty string', async () => {
      mockReq.params = { sessionId: '' };

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle undefined request params', async () => {
      mockReq.params = undefined;

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle null request params', async () => {
      mockReq.params = null;

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle params with undefined sessionId', async () => {
      mockReq.params = { sessionId: undefined };

      await expect(getChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should trim sessionId when querying database', async () => {
      const mockRecords = [
        { userMessage: 'Hello', botReply: 'Hi there', createdAt: new Date() }
      ];

      ChatMessage.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockRecords)
        })
      });

      mockReq.params = { sessionId: '  session123  ' };

      await getChatHistory(mockReq, mockRes);

      expect(ChatMessage.find).toHaveBeenCalledWith({ sessionId: 'session123' });
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

    it('should succeed even when no records to delete (non-existing sessionId)', async () => {
      ChatMessage.deleteMany.mockResolvedValue({ deletedCount: 0 });

      mockReq.params = { sessionId: 'nonexistent-session' };

      await clearChatHistory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Chat history cleared successfully'
        })
      );
      expect(ChatMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'nonexistent-session' });
    });

    it('should handle DB failure during delete (deleteMany throws)', async () => {
      ChatMessage.deleteMany.mockRejectedValue(new Error('Database deletion failed'));

      mockReq.params = { sessionId: 'session123' };

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Database deletion failed');
    });

    it('should throw error when sessionId is missing (undefined)', async () => {
      mockReq.params = {};

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should throw error when sessionId is null', async () => {
      mockReq.params = { sessionId: null };

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

    it('should throw error when sessionId is empty string', async () => {
      mockReq.params = { sessionId: '' };

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle undefined request params', async () => {
      mockReq.params = undefined;

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle null request params', async () => {
      mockReq.params = null;

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should handle params with undefined sessionId', async () => {
      mockReq.params = { sessionId: undefined };

      await expect(clearChatHistory(mockReq, mockRes))
        .rejects
        .toThrow('Session ID is required');
    });

    it('should trim sessionId when deleting from database', async () => {
      ChatMessage.deleteMany.mockResolvedValue({ deletedCount: 3 });

      mockReq.params = { sessionId: '  session123  ' };

      await clearChatHistory(mockReq, mockRes);

      expect(ChatMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
    });
  });
});