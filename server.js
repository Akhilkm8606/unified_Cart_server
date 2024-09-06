const express = require("express");
const Razorpay = require("razorpay");
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require("cors");
const cookieparser = require('cookie-parser');
const connectDB = require("./connection/db");

dotenv.config({ path: path.resolve(__dirname, 'confiq', 'confiq.env') });

console.log("Environment variables loaded");
console.log(`RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID}`);
console.log(`RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET}`);

const app = express();
connectDB();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.use(cookieparser());
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: 'https://unified-cart-client-hhiw.vercel.app',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,

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

app.get("/", (req, res) => {
    console.log("Root endpoint hit");
    res.send("Server is running");
});

// Exporting a handler function for serverless environments
module.exports = (req, res) => {
    console.log("Request received");
    app(req, res); // Pass the request and response to the Express app
};
