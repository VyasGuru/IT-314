import axios from "axios";
import { auth } from "../firebase";

// Configure global axios default baseURL so direct `axios` calls
// (used in some components) respect the environment setting.
// If an explicit backend host is provided (e.g. https://it-314.onrender.com),
// ensure requests target the API mount point by appending `/api` when needed.
const envBackend = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
let DEFAULT_BACKEND = envBackend ? envBackend.replace(/\/+$/g, "") : "/api";
// If using a full origin like https://example.com, make sure it points to the API
if (DEFAULT_BACKEND !== "/api" && !DEFAULT_BACKEND.endsWith("/api")) {
  DEFAULT_BACKEND = `${DEFAULT_BACKEND}/api`;
}
axios.defaults.baseURL = DEFAULT_BACKEND;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: DEFAULT_BACKEND,
  timeout: 30000, // Increased to 30 seconds for slower connections
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// List of public endpoints that don't need authentication
const publicEndpoints = [
  '/users/register',
  '/users/login',
  '/users/google-login',
  '/users/forgot-password',
  '/users/verify-email',
];

// Request interceptor to add Firebase token to requests (except public endpoints)
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if this is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(
        (endpoint) => config.url.includes(endpoint)
      );

      // Only add token for protected endpoints
      if (!isPublicEndpoint) {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
      // Continue without token if there's an error
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Backend returns data in { data, message, success } format
    return response;
  },
  async (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error("Request timeout - Backend server may not be running or is slow to respond");
      error.message = `Request timed out. Please check if the backend server is running at ${DEFAULT_BACKEND}.`;
    }
    
    // Handle network errors
    if (error.message === 'Network Error' || !error.response) {
      console.error("Network error - Cannot connect to backend server");
      error.message = `Cannot connect to backend server. Please ensure the backend is reachable at ${DEFAULT_BACKEND}`;
    }
    
    // Handle 400 Bad Request - include backend error message
    if (error.response?.status === 400) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Invalid request";
      console.error("Bad Request (400):", backendMessage);
      console.error("Full error response:", JSON.stringify(error.response.data, null, 2));
      error.message = backendMessage;
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Optionally refresh token or redirect to login
      console.error("Unauthorized - token may be expired");
    }
    
    // Handle 500 errors
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

