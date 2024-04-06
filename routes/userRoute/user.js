const express = require("express");
const { getUser, userRegister, userLogin, updateUser, deletUser, isAdmin, getAllusers, getAllSellers } = require("../../controllers/userContoller");
const { getToken } = require("../../utils/jwtToken");
const verifyToken = require("../../middlewear/auth");


const routes = express.Router();


routes.route("/user").post(userRegister);
routes.route("/login").post(userLogin,getToken);
routes.route("/userDetails").get(verifyToken,getUser)





// admin
// routes.route("/isadmin").get(verifyToken,isAdmin);

routes.route("/users").get(verifyToken,isAdmin, getAllusers);
routes.route("/Users/:id").post(verifyToken,updateUser).delete(verifyToken,isAdmin,deletUser)

module.exports = routes
