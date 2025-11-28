import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


// Enable CORS (Cross-Origin Resource Sharing)
// This allows your backend to accept requests from the frontend (like React)

// Support comma-separated CORS_ORIGIN and allow reflecting origin when '*' is used.
// Normalize configured origins: if a value looks like a hostname (no protocol),
// prepend 'https://' so Access-Control-Allow-Origin is set to a valid origin string.
const rawCors = process.env.CORS_ORIGIN || "";
const defaultOrigins = ["http://localhost:5173", "https://it-314.vercel.app"];

const allowedOrigins = [
  ...rawCors.split(",").map((s) => s.trim()).filter(Boolean),
  ...defaultOrigins
].map((entry) => {
  // If entry is '*' leave it as is
  if (entry === "*") return entry;
  // If entry already includes protocol, return as-is
  if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
  // If entry looks like a hostname, prepend https:// to make it a valid origin
  if (entry.includes(".")) return `https://${entry}`;
  return entry;
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow wildcard
      if (allowedOrigins.includes("*")) return callback(null, true);

      // Exact match against normalized allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Not allowed
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
// Also accept requests without the `/api` prefix (frontend may be configured without it)
app.use("/properties", router);
app.use("/api/saved-listings", savedListingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comparison", propertyComparisonRoutes);
app.use("/api", priceEstimatorRoutes);
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
