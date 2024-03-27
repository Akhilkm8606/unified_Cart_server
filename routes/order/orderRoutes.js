const express = require("express");
const verifyToken = require("../../middlewear/auth");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrderById, checkOut, checkout, paymentVerification,  } = require("../../controllers/order");


const routes = express.Router();
routes.route("/orders").post(verifyToken,createOrder)
routes.route("/all_orders").get(verifyToken,getAllOrders)
routes.route("/orders/:id").get(getOrderById)
routes.route("/orders/:id").post(updateOrderStatus)
routes.route("/orders/:id").delete(deleteOrderById)
routes.route("/orders/checkout/:id").post(checkout)
routes.route("/orders/checkout/:id").post(checkout)
routes.route("/api/paymentVerification").post(paymentVerification)
routes.get('/api/razorpay/key', (req, res) => {
    const razorpayKeyID = process.env.KEY_ID; // Retrieve the key ID from environment variables
    res.json({ key: razorpayKeyID });
});
module.exports = routes
