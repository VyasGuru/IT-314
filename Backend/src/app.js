import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


// Enable CORS (Cross-Origin Resource Sharing)
// This allows your backend to accept requests from the frontend (like React)

// Support comma-separated CORS_ORIGIN and allow reflecting origin when '*' is used.
const rawCors = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawCors.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  })
);
// Parse incoming JSON data 
app.use(express.json());

// Serve static files (like images, videos, etc.) from the "public" folder
app.use(express.static("public"));

// Allow server to read and handle cookies from client requests
app.use(cookieParser());


//routes
import router from "./routes/property.routes.js";
import userRoutes from "./routes/user.routes.js";
import savedListingRoutes from "./routes/savedListing.routes.js";
import propertyComparisonRoutes from "./routes/propertyComparison.routes.js";
import priceEstimatorRoutes from "./routes/priceEstimator.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import listerVerificationRoutes from "./routes/listerVerification.routes.js";
import adminListingRoutes from "./routes/adminListing.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import reviewRoutes from "./routes/review.routes.js";


//routes declaration

//ust check backend run or not
app.get("/", (req, res) => {
  res.send("Real Estate Backend API is running...");
});


app.use("/api/properties", router);
app.use("/api/saved-listings", savedListingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comparison", propertyComparisonRoutes);
app.use("/api/estimator", priceEstimatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lister-verification", listerVerificationRoutes);
app.use("/api/admin/listings", adminListingRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/reviews", reviewRoutes);


//URL created like this after above statement
//http://localhost:8000/api/properties
//http://localhost:8000/api/saved-listings
//http://localhost:8000/api/users
//http://localhost:8000/api/comparison
//http://localhost:8000/api/estimator
//http://localhost:8000/api/admin


// Export the Express app so it can be used in server.js or index.js
export { app };
