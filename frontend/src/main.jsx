import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Ensure axios default baseURL and interceptors are configured globally
import "./services/api";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { SavedListingsProvider } from "./contexts/SavedListingsContext";  // FIXED
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <SavedListingsProvider>
        <ComparisonProvider>
          <App />
        </ComparisonProvider>
      </SavedListingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
