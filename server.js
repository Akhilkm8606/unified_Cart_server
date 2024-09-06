const express = require("express");
const Razorpay = require("razorpay");
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require("cors");
const cookieparser = require('cookie-parser');
const connectDB = require("./connection/db");
const serverless = require('serverless-http'); // Added for serverless environments

// Load environment variables from config file
dotenv.config({ path: path.resolve(__dirname, 'confiq', 'confiq.env') });

const app = express();

// Connect to the database
connectDB();

// CORS Configuration - Allow multiple origins (local and deployed)
const allowedOrigins = [
  'http://localhost:3000',
  'https://unified-cart-client-hhiw.vercel.app',
  // Add other allowed origins if necessary
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware for cookie parsing
app.use(cookieparser());

// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Content security policy using Helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  })
);

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importing Routes
const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

// API routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoute);

// Root endpoint
app.get("/", (req, res) => {
  console.log("Root endpoint hit");
  res.send("Server is running");
});

// Export for serverless environment
module.exports.handler = serverless(app);  // Use serverless-http to wrap Express app for serverless environments
