const express = require("express");
const Razorpay = require("razorpay");
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require("cors");
const cookieparser = require('cookie-parser');
const connectDB = require("./connection/db");

dotenv.config({ path: path.resolve(__dirname, 'confiq', 'confiq.env') });

const app = express();
connectDB();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log(`Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
console.log(`Razorpay Key Secret: ${process.env.RAZORPAY_KEY_SECRET}`);

app.use(cookieparser());
app.use('/uploads', express.static('uploads'));

app.use(cors({
    credentials: true,
    origin: true,
}));

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoute);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Resource not found',
    });
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    if (process.env.NODE_ENV === 'development') {
        // In development, send detailed error info
        res.status(err.status || 500).json({
            message: err.message,
            stack: err.stack,
        });
    } else {
        // In production, send a generic error message
        res.status(err.status || 500).json({
            message: 'Something went wrong!',
        });
    }
});

module.exports = app;
