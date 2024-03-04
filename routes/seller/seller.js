const express = require("express");
const { getSeller, SellerRegister, sellerLogin, addProduct, updateSeller, deletSeller } = require("../../controllers/sellerController");
const { getToken } = require("../../utils/jwtToken");
const routes = express.Router();

routes.route("/seller").get(getSeller).post(SellerRegister)
routes.route("/login-s").post(sellerLogin,getToken)
routes.route("/seller/:id").get(getSeller).post(updateSeller).delete(deletSeller)

module.exports = routes
