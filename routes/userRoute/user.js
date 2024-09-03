const express = require("express");
const { getUser, userRegister, userLogin, updateUser, deletUser,  getAllusers, getAllSellers, getUserById, ensureSeller, viewDashboard, check, isAdminOrSeller } = require("../../controllers/userContoller");
const { getToken } = require("../../utils/jwtToken");
const verifyToken = require("../../middlewear/auth");


const routes = express.Router();


routes.route("/user").post(userRegister);
routes.route("/login").post(userLogin,getToken);
routes.route("/updateUser/:id").put(verifyToken,updateUser);
routes.route("/userDetails/:id").get(verifyToken,getUserById)





// admin
// routes.route("/isseller").get(verifyToken,ensureSeller,check);

routes.route("/users").get(verifyToken,isAdminOrSeller, getAllusers);
routes.route("/Users/update/:id").put(verifyToken,isAdminOrSeller,updateUser).delete(verifyToken,isAdminOrSeller,deletUser)
routes.route("/User/:id").delete(verifyToken,isAdminOrSeller,deletUser)
routes.route("/viewDashboard").get(verifyToken,ensureSeller,viewDashboard)

module.exports = routes

