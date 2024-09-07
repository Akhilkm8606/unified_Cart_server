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
    addToCart,
    removeFromCart
} = require("../../controllers/productControler");
const verifyToken = require("../../middlewear/auth");
const { getAllProducts } = require("../../controllers/userContoller");

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
router.put("/product/:id", upload.array('images'), uploadToCloudinary, updateProduct);
router.delete("/product/:id", deleteProduct);
router.get("/products", getAllProducts);
router.get("/product/:id", getSingleProduct);

// Cart Routes
router.post("/cart", addToCart);
router.delete("/cart", removeFromCart);

module.exports = router;
