import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    gmail: {
      type: String,
      required: true,
      unique: true,  // Ensure unique Gmail addresses
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic_Url: {
      type: String,
      required: false,  // Profile pic is optional
      trim: true,
    },
  },
  {
    timestamps: true,  // Automatically create createdAt and updatedAt fields
  }
);

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;
