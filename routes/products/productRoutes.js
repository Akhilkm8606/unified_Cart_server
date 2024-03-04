const express = require("express");
const upload = require('../../middlewear/fileUplod'); // Correct import path

const { addProduct, getProduct, addCategory, updateCategory, getCategory } = require("../../controllers/productControler");
const verifyToken = require("../../middlewear/auth");

const routes = express.Router();

// Define routes
routes.route("/seller/:seller_Id/product").post(upload.single("image"), verifyToken, addProduct);
routes.route("/product/list").get(verifyToken, getProduct);
routes.post("/category", verifyToken, addCategory);
routes.get("/categorys", verifyToken,getCategory );

module.exports = routes;
