const mongoose = require('mongoose');
const { isEmail } = require('validator');


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: [isEmail, 'Invalid email format'],
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: function () {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.firstName || 'User')}&background=random`;
    },
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user', 
    index: true,
  },
  shortBio: { 
    type: String, 
    default: '',
    maxlength: [200, 'Short bio cannot exceed 200 characters']
  },
  likedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  fosteredPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  adoptedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
