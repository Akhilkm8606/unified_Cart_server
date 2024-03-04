const Seller =require('../model/seller');
require('dotenv').config();


const jwt = require("jsonwebtoken")
const { hashpass, passwordIsMatch } = require('../utils/password');
const { getToken } = require('../utils/jwtToken');
exports.getSeller = async (req, res) => {
    res.send("this is my seller page");
};
exports.SellerRegister = async (req, res) => {
    const { name,username, email, phoneNumber, address, password, confirmPassword } = req.body;
    

    try {
        if (!name || !username || !email || !phoneNumber || !address || !password || !confirmPassword) {
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
        const seller = await Seller.create({
            name,
            username,
            email,
            phoneNumber,
            address,
            password: hashedPassword,
        });

console.log(seller);
        if (!seller) {
            return res.status(500).json({
                success: false,
                message: "seller registration failed"
            });
        }

        res.status(201).json({
            success: true,
            message: " seller Registration successful!",
            isAuthenticated: true,
            seller: {
                name:seller.name,
                username: seller.username,
                email: seller.email,
                phoneNumber: seller.phoneNumber,
                address: seller.address,
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
exports.sellerLogin = async (req, res,next) => {
    const { email, password } = req.body;
    try {
        // Checking if email and password exist in req.body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        
        // Finding seller based on email
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "Seller not found"
            });
        }
        
        // Checking password match
        const passwordMatch = await passwordIsMatch(password, seller.password);
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        // If all checks pass, assign seller information to req.seller
        req.seller = seller;
        
        // Call getToken middleware
        getToken(req, res, next);      
        
        // Return login success response
      
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};





exports.getSeller = async (req,res) =>{
    const sellerId = req.params.id;
    try {
        const seller = await Seller.findById(sellerId)
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(seller);
        return res.status(200).json({
            success: true,
            seller: seller
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}
exports.updateSeller = async (req,res) =>{
    const sellerId = req.params.id;
    const { name,username } = req.body;

    try {
        const seller = await Seller.findById(sellerId)
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "seller not found",
            });
        }


        seller.name=name;
        seller.username=username;
        await seller.save()
        console.log(seller);
        return res.status(200).json({
            success: true,
            message:"seller details updated successfully!",
            seller: {
                name:seller.name,
                username: seller.username,
                
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}


exports.deletSeller = async (req,res) =>{
    const sellerId = req.params.id;
    try {
        const seller = await Seller.findByIdAndDelete(sellerId)
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(seller);
        return res.status(200).json({
            success: true,
            message: "seller  deleted successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
  

}



