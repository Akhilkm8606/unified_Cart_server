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

console.log(`Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
console.log(`Razorpay Key Secret: ${process.env.RAZORPAY_KEY_SECRET}`);

app.use(cookieparser());
app.use('/uploads', express.static('uploads'));

app.use(cors({
    credentials: true,
    origin: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoute/user");
const productRoutes = require("./routes/products/productRoutes");
const orderRoute = require("./routes/order/orderRoutes");

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoute);

// Exporting a handler function
module.exports = (req, res) => {
    app(req, res); // Pass the request and response to the Express app
};
