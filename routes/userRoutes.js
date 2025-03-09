const express = require('express');
const router = express.Router();
const UserModel = require('../schemas/UserSchema');
const PetModel = require('../schemas/PetSchema');
const addUserMiddleware = require('../middleware/addUserMiddleware');
const {deleteUserAndPets} =  require('../middleware/deleteUserMiddleware');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cloudinary = require('../cloudinary')
const upload = multer({ dest: 'uploads/' });

router.use(addUserMiddleware);

//get all users
router.get('/', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// get user profile details
router.get('/profile/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// update user pfofile details
router.put('/profile/:id', upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  try {
    let avatarUrl = userData.avatar;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pet-adoption',
        public_id: `user_${userId}`,
        overwrite: true,
      });
      avatarUrl = result.secure_url;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { ...userData, avatar: avatarUrl },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});


// update user's password
router.put('/profile/:id/password', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current password and new password are required' });
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ message: 'Error updating user password' });
  }
});


// get user's current role
router.get('/profile/:id/role', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ message: 'Error fetching user role' });
  }
});

// change user's role
router.put('/profile/:id/role', async (req, res) => {
  const userId = req.params.id;
  const newRole = req.body.role;

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// delete user
router.delete('/:id', deleteUserAndPets, async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// get user's pets
router.get('/profile/:id/pets', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const adoptedPets = await PetModel.find({ _id: { $in: user.adoptedPets } }).select('_id type name adoptionStatus picture');
    const fosteredPets = await PetModel.find({ _id: { $in: user.fosteredPets } }).select('_id type name adoptionStatus picture');
    const likedPets = await PetModel.find({ _id: { $in: user.likedPets } }).select('_id type name adoptionStatus picture');
    const userPets = {
      adoptedPets,
      fosteredPets,
      likedPets,
    };

    res.json(userPets);
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({ message: 'Error fetching user pets' });
  }
});

// Get a user's posts
router.get('/profile/:id/posts', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId).populate('posts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

module.exports = router;