

// Token generation (JWT) middleware (assuming in a different file)
const jwt = require("jsonwebtoken");

exports.getToken = (req, res) => {
  if (req.user && req.user._id) {
    const payload = {
      id: req.user._id,
      time: Date.now()
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '50m' });

    console.log('Generated Token:', token);
    console.log('Payload:', payload);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      sameSite: "None", // Adjust as necessary
      secure: true, // Set to true for production with HTTPS
      httpOnly: true
    });

    // Send token and user data as a JSON response
    return res.status(200).json({
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
