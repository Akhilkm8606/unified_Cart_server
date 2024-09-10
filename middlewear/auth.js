const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;
  
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1]; // Remove 'Bearer ' prefix
  } else if (req.cookies.token) {
    token = req.cookies.token; // Get token from cookies
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token.' });
    }
    req.userId = user.id; // Extract user info from token
    next();
  });
};

module.exports = verifyToken;
