const jwt = require('jsonwebtoken');
const KEY = process.env.KEY;

const addUserMiddleware = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (!token) {
    req.isAuthenticated = false;
    return next(); 
  }

  try {
    const decoded = jwt.verify(token, KEY);
    req.userId = decoded._id;
    req.role = decoded.role;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    req.isAuthenticated = false;
    next(); 
  }
};

module.exports = addUserMiddleware;