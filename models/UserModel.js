const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: [isEmail, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{3}\d{3}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Please use the format XXXXXX`
    }
  },
  role: { type: String, default: 'user', index: true },
  shortBio: { type: String, default: '' },
  likedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  fosteredPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  adoptedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;