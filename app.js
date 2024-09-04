const express = require("express");
const Razorpay = require("razorpay");
const dotenv = require('dotenv');
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

// Log key_id and key_secret to ensure they are correct
console.log(`Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
console.log(`Razorpay Key Secret: ${process.env.RAZORPAY_KEY_SECRET}`);

app.use(cookieparser());
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: [true],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your routes
const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoute);

module.exports = app;
