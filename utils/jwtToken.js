const jwt = require("jsonwebtoken");

exports.getToken = (req, res, next) => {
  if (req.user && req.user._id) { // Ensure you are using the correct property to access user ID
    const options = {
      id: req.user._id, // Corrected to _id if your user object has _id
      time: Date.now()
    };
    
    // Make sure to use the correct environment variable name for your JWT secret
    const token = jwt.sign(options, process.env.JWT_SECRET, { expiresIn: '50m' });
    
    console.log(token);
    console.log(options);
    
    return res.status(200).cookie("token", token, { httpOnly: true }).json({ // Added httpOnly for security
      success: true,
      user: req.user,
      token,
      message: "Login successfully completed!",
      isAuthenticated: true
    });
  } else {
    const error = new Error("User information not found in request.");
    console.error(error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: "User information not found in request."
    });
  }
};
