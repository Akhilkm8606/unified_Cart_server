const express = require("express");
const verifyToken = require("../../middlewear/auth");
const { createOrder, getAllOrders, updateOrderStatus, deleteOrderById, paymentVerification, searchOrder, getOrderByUserId, getOrderById,  } = require("../../controllers/order");
const { isAdmin } = require("../../controllers/userContoller");


const routes = express.Router();
routes.route("/orders").post(verifyToken,createOrder)
routes.route("/all_orders").get(verifyToken,isAdmin,getAllOrders)
routes.route("/orderlist/:id").get(verifyToken,getOrderByUserId)
routes.route("/order/:id").get(verifyToken,getOrderById)
routes.route("/order/status/:id").put(verifyToken,updateOrderStatus)
routes.route("/orders/:id").delete(verifyToken,isAdmin,deleteOrderById)
routes.route("/order/search").get(searchOrder)
// routes.route("/orders/checkout/:id").post(checkout)
routes.route("/api/paymentVerification").post(paymentVerification)
routes.get('/api/razorpay/key', (req, res) => {
    const razorpayKeyID = process.env.KEY_ID; // Retrieve the key ID from environment variables
    res.json({ key: razorpayKeyID });
});
module.exports = routes
