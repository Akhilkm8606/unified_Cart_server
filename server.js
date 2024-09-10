const express = require("express");
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { upload, uploadToCloudinary } = require('./middlewear/fileUplod');
const cloudinary = require('cloudinary').v2;
const connectDB = require("./connection/db");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'confiq', 'confiq.env') });

const app = express();

// Connect to the database
connectDB();

// Generate a nonce for CSP
const generateNonce = () => crypto.randomBytes(16).toString('base64');

// Set your domain for CORS
app.use(cors({
  origin: 'https://unified-cart-client-q6vg.vercel.app', // Your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true // Allow credentials like cookies
}));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to handle cookies
app.use(cookieParser());

// Middleware to set CSP headers
app.use((req, res, next) => {
  res.locals.cspNonce = generateNonce();
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' https://checkout.razorpay.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unified-cart-client-q6vg.vercel.app;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self';
    frame-src 'self';
  `);
  next();
});

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unified-cart-client-q6vg.vercel.app"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  })
);

// JSON body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

// Use the imported routes
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
