const multer = require("multer");
const verifyToken = require("../middlewear/auth");
const Product = require("../model/product");
const Category = require("../model/categoryModel");
const slugify = require("slugify")
const upload = require("../middlewear/fileUplod");
const User = require("../model/user");
const Cart = require('../model/cart');



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
            slug: slugify(name)
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

        res.status(200).json({
            success: true, categorys
            ,
            message: "ccategory listed" ,
            count: categorys.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.updateCategory = async (req, res) => {

    const { category } = req.body
    const { id } = req.params
    try {
        const categorys = await Category.findByIdAndUpdate(id, { name:category, slug: slugify(category) }, { new: true });

        res.status(200).json({ success: true, categorys });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.deletCategory = async (req, res) => {
    try {
        const cateId = req.params.id;
        console.log(cateId);
        const deletedCate = await Category.findByIdAndDelete(cateId);
        if (!deletedCate) {
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

        // Update the product's overall rating in the database
        product.rating = overallRating;
        await product.save();

        res.status(200).json({ success: true, message: "Review added successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getReview = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const reviews = product.reviews;
        console.log(reviews);
        res.status(200).json({ success: true, message: "Review added successfully", reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;

        // Find the product by its ID
        const product = await Product.findOneAndUpdate(
            { "reviews._id": reviewId }, // Find the product containing the review with the given ID
            { $pull: { reviews: { _id: reviewId } } }, // Remove the review from the product's reviews array
            { new: true } // Return the updated product
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // If the review was successfully deleted from the product, return the updated product
        res.status(200).json({ success: true, message: "Review deleted successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};







exports.addProduct = async (req, res) => {
    try {
        const userId = req.params.id;
      
        const image = req.files.map(file => file.filename);

        console.log(image);
        const { name, categoryId, price, description, quantity, features ,reviews} = req.body;
      
     

        if (!name || !categoryId || !price || !description || !quantity || !features || !image ) {
            return res.status(400).json({
                success: false,
                message: "All fields including images and reviews are required"
            });
        }


        // Calculate the overall rating
       // Filter out reviews without a valid rating

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
            category:category.name,
            price,
            features,
            images: image,
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
            category:category.name,
            price,
            description,
            quantity,
            features,
            images: image,
            reviews: reviews,
           
        });

        res.status(200).json({
            success: true,
            message: "Product added successfully",
            product: product,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};


exports.getProductByUserId = async (req, res) => {
    const userId = req.userId;
    try {
        // Find the product by its ID and seller ID
        const products = await Product.find({userId});
        console.log(products);
        if (!userId) {
            return res.status(404).json({ success: false, message: "Products not found" });
        }
        console.log(products);
        res.status(200).json({ success: true,productCouts:products.length, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getProduct = async (req, res) => {

    const productId = req.params.id;
    try {
        // Find the product by its ID and seller ID
        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        console.log(product);
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
      const { name, categoryId, price, description, quantity, features, reviews } = req.body;
      const { id } = req.params;
      
      let images = req.body.images; // Existing images if no new files uploaded
  
      if (req.files && req.files.length > 0) {
        images = req.files.map(file => file.filename); // New images if files uploaded
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          category: categoryId,
          price,
          description,
          quantity,
          features,
          reviews,
          images
        },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      res.status(200).json({ success: true, message: 'Product updated successfully', updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

exports.deletProduct = async (req, res) => {
    const {id: proudctId} = req.params
    try {
        const deletedCart = await Product.findByIdAndDelete(proudctId);
        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: "proudct not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "proudct deleted successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

}




//   cart 



exports.addCart = async (req, res) => {
    const userId = req.userId;
    const { id: productId } = req.params;
    const { quantity } = req.body;
    
    try {
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Please provide userId and productId"
            });
        }

        // Find existing cart item
        let existingCart = await Cart.findOne({ userId: userId, productId });
        if (existingCart) {
            // Product already in the cart, update quantity and amount
            existingCart.quantity += parseInt(quantity || 1);
            existingCart.amount = existingCart.quantity * existingCart.price; // Recalculate amount based on updated quantity
            await existingCart.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                cart: existingCart
            });
        } else {
            // Product not in the cart, create a new cart item
            const product = await Product.findOne({ _id: productId });
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
                price: product.price // Assign product price to cart item
            });

            return res.status(200).json({
                success: true,
                message: "Cart added successfully",
                cart
            });
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
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



exports.deletCart = async (req, res) => {
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
