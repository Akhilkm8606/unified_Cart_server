const { getToken } = require('../utils/jwtToken');
const User = require('../model/user');
const Product = require('../model/product');
const Order = require('../model/order');
const Category = require("../model/categoryModel");



const { hashpass, passwordIsMatch } = require('../utils/password');



exports.userRegister = async (req, res) => {
    const { username, email, phone, address, password, confirmPassword } = req.body;

    try {
        if (!username || !email || !phone || !address || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const hashedPassword = await hashpass(password);
        const user = await User.create({
            username,
            email,
            phone,
            address,
            password: hashedPassword,
        });

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User registration failed"
            });
            
        }

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            isAuthenticated: true,
            user: {
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.userLogin = async (req, res,next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        console.log();
       
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const passwordMatch = await passwordIsMatch(password, user.password)
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        req.user= user;
        getToken(req,res,next) 
        // res.status(200).json({
        //     success: true,
          
        //     message: "Login successfully completed!"
        // });
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        }); 
    }
}

exports.getUser = async (req,res) =>{
    const userId = req.userId;
   

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(user);
        return res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}
exports.getUserById = async (req,res) =>{
    const userId = req.params.id   

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(user);
        return res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}
exports.updateUser = async (req,res) =>{
    const userId = req.params.id
    
   
 const { name,email,phone,status,role } = req.body;

    try {
        const user = await User.findById(userId)
       
        if (!user) {
            console.log(error);
            return res.status(400).json({
                success: false,
                message: "user not found",
            });
        }


        if (name) {
            user.username = name;
        }
        if (email) {
            user.email = email;
        }
        if (phone) {
            user.phone = phone;
        }
        if (status) {
            user.status = status;
        }
        if (role) {
            user.role = role;
        }

 
        await user.save()
       
        return res.status(200).json({
            success: true,
            message:"user details updated successfully!",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}


exports.deletUser = async (req,res) =>{
    const userId = req.params.id;
    console.log(userId);
    try {
        const user = await User.findByIdAndDelete(userId)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(user);
        return res.status(200).json({
            success: true,
            message: "user  deleted successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}

// admin



exports.isAdmin = async (req, res, next) => {
    const userId = req.userId;
    try {
       
        
       
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "User is not an admin"
            });
        }
     else{
        next();
     }
       
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error checking admin status"
        });
    }
};

exports.getAllusers  = async (req,res) =>{
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
          return  res.status(404).json(
                { success: false, 
                message: "users not found",
                 });
            
        }
         res.status(200).json({
            success: true,
            count: users.length,
            message: "users found",
            users
        });
    
    
    } catch (error) {

        console.error(error);
         res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }

}

exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }); // Fetch all users with the role 'seller'
        
        if (!sellers || sellers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No sellers found"
            });
        }
        
         res.status(200).json({
            success: true,
            count: sellers.length,
            message: "Sellers found",
            sellers: sellers
        });
    } catch (error) {
        console.error(error);
         res.status(500).json({
            success: false,
            message: "Internal server error"
            
        });
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const resultPerPage = 5;
        let query = {};

        // Check if keyword exists in the query string
        const { keyword } = req.query;

        if (keyword) {
            const productQuery = {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for product name
                    { description: { $regex: keyword, $options: 'i' } } // Case-insensitive search for product description
                    // Add more fields to search here if needed
                ]
            };

            const categoryQuery = {
                name: { $regex: keyword, $options: 'i' } // Case-insensitive search for category name
            };

            // Fetch products and categories based on the keyword
            const products = await Product.find(productQuery);
            const categories = await Category.find(categoryQuery);

            if ((!products || products.length === 0) && (!categories || categories.length === 0)) {
                return res.status(404).json({ success: false, message: "No products or categories found" });
            }

            return res.status(200).json({
                success: true,
                products,
                categories
            });
        }

        // If no keyword is provided, fetch all products
        const products = await Product.find();

        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found" });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            message: "All products list",
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// seller
exports.ensureSeller = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'seller') {
            return res.status(403).json({
                success: false,
                message: "User is not an seller"
            });
        }
     else{
        next();
     }
       
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error checking admin status"
        });
    }}


   

exports.viewDashboard = async (req, res) => {
    try {
      const userId = req.userId;
      console.log('Seller ID:', userId);
  
      // Fetch all products for the seller
      const products = await Product.find({ userId });
      if (products.length === 0) {
        return res.status(404).json({ success: false, message: 'No products found for this seller' });
      }
  
      // Get an array of product IDs
      const productIds = products.map(product => product._id);
      console.log('Product IDs:', productIds);
  
      // // Log the exact query
      const query = { 'items.product': { $in: productIds } };
      console.log('Order Query:', query);
  
      // Find orders that contain any of the product IDs
      const orders = await Order.find(query);
      console.log('Orders:', orders);
  
      if (orders.length === 0) {
        return res.status(404).json({ success: false, message: 'No orders found for this seller' });
      }
  
      // Respond with products and their related orders
      return res.status(200).json({
        success: true,
        dashboard: {
            orderCount: orders.length,
          productCount: products.length,
          products,
          orders,
          
        },
      });
    } catch (error) {
      console.error('Error fetching seller dashboard data:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
