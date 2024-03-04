const jwt = require('jsonwebtoken');

// Middleware function to verify token
const verifyToken = (req, res, next) => {
    // Extract token from request headers
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required.' });
    }
    // Verify token
    jwt.verify(token,  process.env.JWT_SECREATE_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        // Extracted information from the token (payload)
        req.userId = decoded.id; // Assuming the token contains user ID
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports =verifyToken