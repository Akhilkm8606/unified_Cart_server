const express = require("express");
const { getUser, userRegister, userLogin, updateUser, deletUser, isAdmin, getAllusers, getAllSellers, getAllProducts } = require("../../controllers/userContoller");
const { getToken } = require("../../utils/jwtToken");
const { addCart, getCart, deletCart } = require("../../controllers/cartController");
const verifyToken = require("../../middlewear/auth");
const upload = require('../../middlewear/fileUplod'); // Correct import path

const { getProduct, addProduct, searchProducts } = require("../../controllers/productControler");
const routes = express.Router();


routes.route("/user").post(userRegister);
routes.route("/login").post(userLogin,getToken);
routes.route("/userDetails").get(verifyToken,getUser).post(verifyToken,updateUser).delete(verifyToken,deletUser)
routes.route("/product/addCart/:id").post(verifyToken, addCart);

routes.route("/user/carts").get(verifyToken,getCart)
routes.route("/user/cart/delete/:id").delete(verifyToken,deletCart)
routes.route("/product/:id").get(getProduct)
routes.route("/addproduct").post(upload.array("image"), verifyToken, addProduct);


// routes.route("/login").get(verifyToken,isSeller);



// admin
// routes.route("/isadmin").get(verifyToken,isAdmin);

routes.route("/users").get(verifyToken,isAdmin, getAllusers);
routes.route("/sellers").get(verifyToken,isAdmin, getAllSellers);
routes.route("/products").get( getAllProducts);
module.exports = routes
