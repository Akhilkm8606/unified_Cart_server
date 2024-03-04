const multer = require("multer");
const verifyToken = require("../middlewear/auth");
const Product = require("../model/product");
const Category = require("../model/categoryModel");
const slugify = require ("slugify")
const upload = require("../middlewear/fileUplod");


exports.addCategory = async (req, res) => {

    try {
        const { name
             } = req.body;
   
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All fields  required"
            });
        }
        const existingCategory = await Category.findOne({
            name,
        })
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "product category exist,"
            });
        }
        const categorys = await Category.create({
            name,
          slug:slugify(name)
        });
        console.log();
        res.status(200).json({
            success: true,
            categorys,
            message: "category updated "
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }


};
exports.getCategory = async (req, res) => {
 
    try {
        const categorys = await Category.find();
        
        res.status(200).json({ success: true, categorys });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateCategory = async (req, res) => {
  
    const {category} = req.body
    const {id} = req.params
    try {
        const categorys = await Category.findByIdAndUpdate(id,{ category,slug:slugify(category) },{new:true});
        
        res.status(200).json({ success: true, categorys });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.addProduct = async (req, res) => {
    try {
        const sellerId = req.userId;
        const image = req.file.filename;

        const { name, categoryId, price, brand, description, quantity, features,images } = req.body;

        if (!name || !categoryId || !price || !brand || !description || !quantity || !features || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields including image are required"
            });
        }

        const existingProduct = await Product.findOne({
            sellerId,
            name,
            categoryId,
            price,
            brand,
            features,
            // images: image
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product already exists. Please update the existing product quantity."
            });
        }

        const product = await Product.create({
            sellerId,
            name,
            categoryId,
            price,
            brand,
            description,
            quantity,
            features,
            images: image
        });

        res.status(200).json({
            success: true,
            message: "Product added successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};




exports.getProduct = async (req, res) => {
    const userId = req.userId;
    try {
        const products = await Product.find({ sellerId: userId });
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: " products list found " });
        }
        
        console.log(products);
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




exports.updateProduct = async (req, res) => {
    const userId = req.userId;
    try {
        const products = await Product.find({ sellerId: userId });
        console.log(products);
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};