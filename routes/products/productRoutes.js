const express = require("express");
const upload = require('../../middlewear/fileUplod'); // Correct import path
const { addProduct, getProduct, addCategory, updateCategory, getCategory, addCart, getCart, editCart, deletCart, addReview, getReview, deleteReview, deletCategory, deletProduct, updateProduct, getProductByUserId } = require("../../controllers/productControler");
const verifyToken = require("../../middlewear/auth");
const { getAllProducts, isAdmin, ensureSeller } = require("../../controllers/userContoller");
const { get } = require("mongoose");
const checkAdminOrSeller = require("../../middlewear/checkAdminOrSeller");

const routes = express.Router();

// Define routes
routes.route("/addproduct/:id").post(upload.array("image",5), verifyToken,checkAdminOrSeller, addProduct);
routes.post("/addcategories", verifyToken, isAdmin, addCategory);
routes.get("/categorys", getCategory );
routes.route("/categorys/update/:id").post(verifyToken, isAdmin,  updateCategory );
routes.route("/categorys/delete/:id").delete(verifyToken, isAdmin, deletCategory );

// products
routes.route("/products").get( getAllProducts);         
routes.route("/product/:id").get( getProduct);
routes.route("/seller/products").get( verifyToken,ensureSeller,getProductByUserId);
routes.route("/product/update/:id").post(upload.array("image"),verifyToken,checkAdminOrSeller,updateProduct)
routes.route("/product/:id").delete(deletProduct)

//review

routes.route("/addreview/:id").post( verifyToken, addReview);
routes.route("/getReview/:id").get( verifyToken, getReview);
routes.route("/deletereview/:id").delete( verifyToken, deleteReview);


//cart
routes.route("/product/addCart/:id").post(verifyToken, addCart);

routes.route("/user/carts/:id").get(verifyToken,getCart)
routes.route("/user/cart/edit/:id").put(verifyToken,editCart)
routes.route("/user/cart/delete/:id").delete(verifyToken,deletCart)


module.exports = routes;
