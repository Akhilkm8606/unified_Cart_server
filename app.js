const express = require("express");
const Razorpay = require("razorpay");

const app = express();

const dotenv = require('dotenv')
const path =require('path');
const cors = require("cors");
const cookieparser = require('cookie-parser')

const userRoutes = require("./routes/userRoute/user");

const productRoutes = require("./routes/products/productRoutes");

const orderRoute = require("./routes/order/orderRoutes");
dotenv.config({path: path.resolve(__dirname, 'confiq', 'confiq.env')});
app.use(cookieparser())
app.use('/uploads', express.static('uploads'));


app.use(cors({
    credentials: true,
    origin: true,
}));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//create router
app.use("/",userRoutes)

app.use("/",productRoutes)

app.use("/",orderRoute)


module.exports = app;

