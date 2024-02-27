const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const secretKey = process.env.KEY; 
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No access token provided' });
    }

    const decoded = jwt.verify(token, secretKey);

    const user = await UserModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

module.exports = authMiddleware;