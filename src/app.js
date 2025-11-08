import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


// Enable CORS (Cross-Origin Resource Sharing)
// This allows your backend to accept requests from the frontend (like React)
app.use(cors({
  origin: process.env.CORS_ORIGIN, // only allow requests from this frontend URL
  credentials: true // allow cookies & auth headers
}));

// Parse incoming JSON data 
app.use(express.json());

// Serve static files (like images, videos, etc.) from the "public" folder
app.use(express.static("public"));

// Allow server to read and handle cookies from client requests
app.use(cookieParser());


//routes
import router from "./routes/property.routes.js";
import userRoutes from "./routes/user.routes.js";
import savedListingRoutes  from "./routes/property.routes.js";


//routes declaration
app.get("/", (req, res) => {
  res.send("Real Estate Backend API is running...");
});


app.use("/api/properties", router);
app.use("/api/saved-listings", savedListingRoutes);
app.use("/api/users", userRoutes);


//URL created like this after above statement
//http://localhost:8000/api/properties
//http://localhost:8000/api/saved-listings
//http://localhost:8000/api/users


// Export the Express app so it can be used in server.js or index.js
export { app };
