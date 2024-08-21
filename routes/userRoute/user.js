const express = require("express");
const { getUser, userRegister, userLogin, updateUser, deletUser, isAdmin, getAllusers, getAllSellers, getUserById, ensureSeller, viewDashboard, check } = require("../../controllers/userContoller");
const { getToken } = require("../../utils/jwtToken");
const verifyToken = require("../../middlewear/auth");


const routes = express.Router();


routes.route("/user").post(userRegister);
routes.route("/login").post(userLogin,getToken);
routes.route("/updateUser/:id").put(verifyToken,updateUser);
routes.route("/userDetails/:id").get(verifyToken,getUserById)





// admin
// routes.route("/isseller").get(verifyToken,ensureSeller,check);

routes.route("/users").get(verifyToken,isAdmin, getAllusers);
routes.route("/Users/update/:id").put(verifyToken,isAdmin,updateUser).delete(verifyToken,isAdmin,deletUser)
routes.route("/User/:id").delete(verifyToken,isAdmin,deletUser)
routes.route("/viewDashboard").get(verifyToken,ensureSeller,viewDashboard)

module.exports = routes

