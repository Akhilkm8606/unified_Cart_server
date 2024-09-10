const jwt = require("jsonwebtoken");

exports.getToken = (req, res) => {
  if (req.user && req.user._id) { // Ensure you are using the correct property to access user ID
    const payload = {
      id: req.user._id, // Corrected to _id if your user object has _id
      time: Date.now()
    };

    // Generate token with JWT secret and 50-minute expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '50m' });
    
    console.log('Generated Token:', token);
    console.log('Payload:', payload);
    res.cookie("token", token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
             })
    // Send token as a secure, HTTP-only cookie and as a JSON response
    return res.status(200)

      .json({
        success: true,
        user: req.user,
        token,
        message: "Login successfully completed!",
        isAuthenticated: true
      });
  } else {
    return res.status(500).json({
      success: false,
      message: "User information not found in request."
    });
  }
};
