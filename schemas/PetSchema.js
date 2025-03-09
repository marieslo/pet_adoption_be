const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  adoptionStatus: {
    type: String,
    required: true
  },
  picture: String,
  heightCm: {
    type: Number,
    required: true
  },
  weightKg: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  hypoallergenic: {
    type: Boolean,
    required: true
  },
  dietaryRestrictions: String,
  breed: {
    type: String,
    required: true
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  adoptedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  fosteredBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
});

const PetModel = mongoose.model('Pet', petSchema);
module.exports = PetModel;