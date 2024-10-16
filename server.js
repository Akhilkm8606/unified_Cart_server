const express = require("express");
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { upload, uploadToCloudinary } = require('./middlewear/fileUplod');
const cloudinary = require('cloudinary').v2;
const connectDB = require("./connection/db");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'confiq', 'confiq.env') });

const app = express();

// Connect to the database
connectDB();

// Set up CORS with proper headers
app.use(cors({
  origin: 'https://unified-cart-client-q6vg.vercel.app', // Your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Allow credentials like cookies
  allowedHeaders: 'Content-Type,Authorization'
}));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to handle cookies
app.use(cookieParser());

// Set security headers with Helmet
app.use(helmet());

// Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'", "https://unified-cart-client-q6vg.vercel.app"],
    scriptSrc: ["'self'", "https://checkout.razorpay.com"],
  },
}));

// Increase request body size limits to prevent "Payload Too Large" errors
app.use(express.json({ limit: '50mb' })); // JSON body limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // URL-encoded data limit

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoute);

// Root endpoint for server testing
app.get("/", (req, res) => {
  console.log("Root endpoint hit");
  res.send("Server is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
