const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const UserModel = require('../models/UserModel');
const KEY = process.env.KEY;


router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, isAdmin } = req.body;
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const role = isAdmin ? 'admin' : 'user'; 
    const user = await UserModel.create({ email, passwordHash, firstName, lastName, phoneNumber, role });
    const token = jwt.sign({ _id: user._id, role: user.role }, KEY, { expiresIn: '30d' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Signup process was unsuccessful' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    const token = jwt.sign({ _id: user._id, role: user.role }, KEY, { expiresIn: '30d' });
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

module.exports = router;