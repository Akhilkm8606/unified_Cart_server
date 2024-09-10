
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required.' });
    }


    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        req.userId = decoded.id; // Extract the user ID from the token payload
        next();
    });
};

  
module.exports = verifyToken;
