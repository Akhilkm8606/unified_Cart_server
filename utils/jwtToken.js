const jwt = require("jsonwebtoken");

exports.getToken = (req, res, next) => {
  if (req.user && req.user.id) {
        const options = {
            id: req.user._id,
            time: Date.now()
        };
        const token = jwt.sign(options, process.env.JWT_SECREATE_KEY, { expiresIn: '50min' });
        console.log(token);
        console.log(options);
        return res.status(200).cookie("token", token).json({
            success: true,
            user: req.user,
            token,
            message: "Login successfully completed!",
            isAuthenticated: true
        });
    } else {
        const error = new Error("Seller information not found in request.");
        console.error(error.message);
        console.error(error.stack);
        return res.status(500).json({
            success: false,
            message: "Seller information not found in request."
        });
    }
};
