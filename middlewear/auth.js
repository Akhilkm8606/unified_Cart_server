
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract token from cookies
    const { token } = req.cookies;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required.' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        // Extract user ID from the decoded token and add to request object
        req.userId = decoded.id; 
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = verifyToken;
