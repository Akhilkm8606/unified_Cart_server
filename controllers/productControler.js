const multer = require("multer");
const verifyToken = require("../middlewear/auth");
const Product = require("../model/product");
const Category = require("../model/categoryModel");
const slugify = require("slugify");
const { upload, uploadToCloudinary } = require("../middlewear/fileUplod");
const User = require("../model/user");
const Cart = require('../model/cart');
const cloudinary = require('cloudinary').v2;
const Order = require('../model/order');


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
// exports.addReview = async (req, res) => {
//     try {
//         const userId = req.userId;
//         const reviewData = req.body;
//         const productId = req.params.id;

//         const product = await Product.findById(productId);
//         const user = await User.findById(userId);

//         if (!product) {
//             return res.status(404).json({ success: false, message: "Product not found" });
//         }

//         const review = {
//             ...reviewData,
//             username: user.username
//         };

//         product.reviews.push(review);
//         await product.save();

//         const validReviews = product.reviews.filter(review => review.rating !== undefined);
//         let overallRating = 0;
//         if (validReviews.length > 0) {
//             const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
//             overallRating = totalRating / validReviews.length;
//         }

//         product.rating = overallRating;
//         await product.save();

//         res.status(200).json({ success: true, message: "Review added successfully", product });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };
exports.addReview = async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the request (auth middleware)
        const reviewData = req.body; // Get review data from the request body
        const productId = req.params.id; // Get the product ID from request parameters

        // Find the product and user by their IDs
        const product = await Product.findById(productId);
        const user = await User.findById(userId);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check if the user has purchased the product (assuming you have an Order model)
        const hasPurchased = await Order.findOne({ user: userId, 'items.product': productId });
        if (!hasPurchased) {
            return res.status(400).json({ success: false, message: "You can only review a product you have purchased." });
        }

        // Check if the user has already reviewed this product
        const alreadyReviewed = product.reviews.find(review => review.userId === userId);
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "You have already added a review for this product." });
        }

        // Add the new review with userId
        const review = {
            ...reviewData,
            userId:user.Id, // Make sure userId is included
            username: user.username // Store the username for the review
        };

        // Add the review to the product's reviews array
        product.reviews.push(review);
        await product.save();

        // Recalculate the overall product rating
        const validReviews = product.reviews.filter(review => review.rating !== undefined);
        let overallRating = 0;
        if (validReviews.length > 0) {
            const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
            overallRating = totalRating / validReviews.length;
        }

        product.rating = overallRating; // Update the product rating
        await product.save(); // Save the updated product details

        // Send a success response
        res.status(200).json({ success: true, message: "Review added successfully", product });
    } catch (error) {
        console.error(error); // Log the error for debugging
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

        res.status(200).json({ success: true, 
            
            reviews: product.reviews, 
            length: product.reviews.length
        });
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
  
      if (!name || !categoryId || !price || !description || !quantity || !features || images.length === 0) {
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
  
      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product
      });
  
    } catch (error) {
      console.error('Error in addProduct:', error); // Improved logging
      res.status(500).json({
        message: 'Failed to add product',
        error: error.message
      });
    }
  };
  
  
  // Update Product
  exports.updateProduct = async (req, res) => {
    try {
      const userId = req.userId;
      const productId = req.params.id;
  
      // Log for debugging
      console.log("UserId from req.userId:", userId);
      console.log("ProductId from req.params.id:", productId);
  
      // Check if files are provided for upload
      let images = [];
      if (req.files && req.files.length > 0) {
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
  
        // Wait for all the image uploads to complete
        images = await Promise.all(imagePromises);
      }
  
      const { name, categoryId, price, description, quantity, features, reviews } = req.body;
  
      // Prepare update data
      const updateData = {};
  
      // Only add the fields that are present in the request body
      if (name) updateData.name = name;
      if (categoryId) {
        // Ensure the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Category not found"
          });
        }
        updateData.categoryId = categoryId;
        updateData.category = category.name; // Optionally update the category name as well
      }
      if (price) updateData.price = price;
      if (description) updateData.description = description;
      if (quantity) updateData.quantity = quantity;
      if (features) updateData.features = features;
      if (reviews) updateData.reviews = reviews;
  
      // Add images to updateData only if new images are provided
      if (images.length > 0) {
        updateData.images = images;
      }
  
      // TEMPORARY: Remove userId check for debugging
      const product = await Product.findOneAndUpdate(
        { _id: productId },  // Without userId for now
        updateData,
        { new: true } // This ensures the updated document is returned
      );
  
      if (!product) {
        console.log("Product not found");
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
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
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
exports.getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.userId; // `userId` is set by the auth middleware
        console.log('Seller ID:', sellerId); // Log the sellerId to ensure it's correct

        // Fetch products where `userId` matches
        const products = await Product.find({ userId: sellerId });

        console.log('Products:', products); // Log the products fetched to see the results

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
    const userId = req.userId; // Retrieved from the verified token
    const { id: productId } = req.params;
    const { quantity } = req.body;
    
    try {
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Please provide userId and productId"
            });
        }

        let existingCart = await Cart.findOne({ userId, productId });
        if (existingCart) {
            // Update cart item
            existingCart.quantity += parseInt(quantity || 1);
            existingCart.amount = existingCart.quantity * existingCart.price;
            await existingCart.save();
            
            return res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                cart: existingCart
            });
        } else {
            // Create new cart item
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const cart = await Cart.create({
                userId,
                productId,
                quantity: parseInt(quantity || 1),
                price: product.price,
            });

            return res.status(200).json({
                success: true,
                message: "Cart added successfully",
                cart
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.getCart = async (req, res) => {
    const userId = req.params.id; // Assuming userId is passed in params

    try {
        const userCart = await Cart.find({ userId }).populate("productId");

        if (!userCart || userCart.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        res.status(200).json({
            length: userCart.length,
            success: true,
            userCart
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
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
