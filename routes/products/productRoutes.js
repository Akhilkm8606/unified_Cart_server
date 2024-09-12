const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../../middlewear/fileUplod");
const {
    addCategory,
    getCategory,
    updateCategory,
    deletCategory,
    addReview,
    getReview,
    deleteReview,
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
    removeFromCart,
    editCart,
    getCart,
    addToCart,
    getSellerProducts
} = require("../../controllers/productControler");
const verifyToken = require("../../middlewear/auth");
const { getAllProducts, isAdminOrSeller } = require("../../controllers/userContoller");

// Category Routes
router.post("/category", addCategory);
router.get("/categories", getCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deletCategory);

// Review Routes
router.post("/review/:id", verifyToken, addReview);
router.get("/reviews/:id", getReview);
router.delete("/review/:id", deleteReview);

// Product Routes
router.post('/product/:id', upload.array('images'), uploadToCloudinary, addProduct);
router.post("/product/edit/:id", upload.array('images'), uploadToCloudinary, updateProduct);
router.delete("/product/:id", deleteProduct);
router.get("/products", getAllProducts);
router.get("/product/:id", getSingleProduct);
router.get("/seller/product/:id", getSellerProducts);

// Cart Routes
router.post("/product/addCart/:id", verifyToken,addToCart);
router.delete("/cart/:id", verifyToken,removeFromCart);
router.get("/carts/:id", verifyToken, getCart);
router.put("/cart/edit/:id", verifyToken, editCart);

module.exports = router;
