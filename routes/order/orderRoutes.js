const express = require("express");
const verifyToken = require("../../middlewear/auth");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrderById } = require("../../controllers/order");


const routes = express.Router();
routes.route("/orders").post(verifyToken,createOrder)
routes.route("/all_orders").get(verifyToken,getAllOrders)
routes.route("/orders/:id").get(getOrderById)
routes.route("/orders/:id").post(updateOrderStatus)
routes.route("/orders/:id").delete(deleteOrderById)
module.exports = routes
