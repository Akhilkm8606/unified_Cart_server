// middleware/checkAdminOrSeller.js
const User = require('../model/user'); // Adjust the path to your User model

const checkAdminOrSeller = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === 'admin' || user.role === 'seller') {
      return next(); // User is either admin or seller, proceed to the next middleware/controller
    }

    return res.status(403).json({
      success: false,
      message: "User is not authorized"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error checking user role"
    });
  }
};

module.exports = checkAdminOrSeller;
