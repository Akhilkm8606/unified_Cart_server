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

// Set your domain for CORS (replace with your actual client domain)


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

// Setting up cookie security
app.use((req, res, next) => {
  res.cookie('myCookie', 'cookieValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'Lax' // Set to 'None' for cross-site cookie usage
  });
  next();
});

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://unified-cart-client-q6vg.vercel."],
      scriptSrc: ["'self'"],
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