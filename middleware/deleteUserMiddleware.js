const UserModel = require('../models/UserModel');
const PetModel = require('../models/PetModel');


const deleteUserAndPets = async (req, res, next) => {
  try {
    const userId = req.params.id; 
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await PetModel.deleteMany({ _id: { $in: deletedUser.likedPets } });
    await PetModel.deleteMany({ _id: { $in: deletedUser.fosteredPets } });
    await PetModel.deleteMany({ _id: { $in: deletedUser.adoptedPets } });

    res.json({ message: 'User and associated pets deleted successfully' });
  } catch (error) {
    console.error('Error deleting user and associated pets:', error);
    res.status(500).json({ message: 'Error deleting user and associated pets', error: error.message });
  }
};

module.exports = { deleteUserAndPets };