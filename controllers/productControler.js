const multer = require("multer");
const verifyToken = require("../middlewear/auth");
const Product = require("../model/product");
const Category = require("../model/categoryModel");
const slugify = require("slugify");
const { upload, uploadToCloudinary } = require("../middlewear/fileUplod");
const User = require("../model/user");
const Cart = require('../model/cart');
const cloudinary = require('cloudinary').v2;

// Add Category
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }
        const category = await Category.create({
            name,
            slug: slugify(name)
        });
        res.status(200).json({
            success: true,
            category,
            message: "Category added successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get Categories
exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            success: true,
            categories,
            message: "Categories listed successfully",
            count: categories.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndUpdate(id, {
            name,
            slug: slugify(name)
        }, { new: true });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete Category
exports.deletCategory = async (req, res) => {
    try {
        const cateId = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(cateId);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Add Review
exports.addReview = async (req, res) => {
    try {
        const userId = req.userId;
        const reviewData = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        const user = await User.findById(userId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const review = {
            ...reviewData,
            username: user.username
        };

        product.reviews.push(review);
        await product.save();

        const validReviews = product.reviews.filter(review => review.rating !== undefined);
        let overallRating = 0;
        if (validReviews.length > 0) {
            const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
            overallRating = totalRating / validReviews.length;
        }

        product.rating = overallRating;
        await product.save();

        res.status(200).json({ success: true, message: "Review added successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Review
exports.getReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, reviews: product.reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const product = await Product.findOneAndUpdate(
            { "reviews._id": reviewId },
            { $pull: { reviews: { _id: reviewId } } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.status(200).json({ success: true, message: "Review deleted successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add Product



exports.addProduct = async (req, res) => {
  try {
    const userId = req.params.id;

    const images = req.imageUrls || [];

    const { name, categoryId, price, description, quantity, features, reviews } = req.body;

    if (!name || !categoryId || !price || !description || !quantity || !features || !images) {
      return res.status(400).json({
        success: false,
        message: "All fields including images and reviews are required"
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const existingProduct = await Product.findOne({
      userId,
      name,
      categoryId,
      category: category.name,
      price,
      features,
      images
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists. Please update the existing product quantity."
      });
    }

    const product = await Product.create({
      userId,
      name,
      categoryId,
      category: category.name,
      price,
      description,
      quantity,
      features,
      images,
      reviews
    });

    res.status(200).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

  
  // Update Product
  exports.updateProduct = async (req, res) => {
    try {
      const userId = req.userId;
      const productId = req.params.id;
  
      // Upload images to Cloudinary
      const imagePromises = req.files.map(file =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }).end(file.buffer);
        })
      );
  
      const images = await Promise.all(imagePromises);
  
      const { name, categoryId, price, description, quantity, features, reviews } = req.body;
  
      if (!name || !categoryId || !price || !description || !quantity || !features || !images) {
        return res.status(400).json({
          success: false,
          message: "All fields including images and reviews are required"
        });
      }
  
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
  
      const product = await Product.findOneAndUpdate(
        { userId, _id: productId },
        {
          name,
          categoryId,
          category: category.name,
          price,
          description,
          quantity,
          features,
          images,
          reviews
        },
        { new: true }
      );
  
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Products
exports.getProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const products = await Product.find({ userId });

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Single Product
exports.getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add to Cart

exports.addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Product added to cart successfully", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


 exports.getCart = async (req, res) => {
    const userId = req.params.id;
    
    try {
        const userCart = await Cart.find({ userId }).populate("productId");        
        
        if (!userCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
       
        res.status(200).json({
            length: userCart.length ,
            success: true,
            userCart   
         });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Controller
exports.editCart = async (req, res) => {
    const { id: cartId } = req.params;
    const { quantity: newQuantity } = req.body;

    try {
        const existingCart = await Cart.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Calculate the new quantity by adding the current quantity and the new quantity
        const currentQuantity = existingCart.quantity || 0;
        const difference = newQuantity - currentQuantity;
        const updatedCart = await Cart.findByIdAndUpdate(cartId, { quantity: newQuantity }, { new: true });

        if (!updatedCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Calculate the new total amount
        updatedCart.amount += difference * updatedCart.price;
        await updatedCart.save();

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: updatedCart
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



exports.removeFromCart = async (req, res) => {
    const {id: cartId} = req.params
    try {
        const deletedCart = await Cart.findByIdAndDelete(cartId);
        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cart deleted successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

}
