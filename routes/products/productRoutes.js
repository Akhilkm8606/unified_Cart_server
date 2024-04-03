const express = require("express");
const upload = require('../../middlewear/fileUplod'); // Correct import path

const { addProduct, getProduct, addCategory, updateCategory, getCategory } = require("../../controllers/productControler");
const verifyToken = require("../../middlewear/auth");

const routes = express.Router();

// Define routes
routes.route("/seller/product").post(upload.array("image"), verifyToken, addProduct);
routes.route("/product/list").get(verifyToken, getProduct);
routes.post("/category", verifyToken, addCategory);
routes.get("/categorys", getCategory );

module.exports = routes;
