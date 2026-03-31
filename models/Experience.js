import mongoose from 'mongoose';
import User from './User';  // Import the User model

// Define the Experience schema
const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,  // This links to the User model
      ref: User,  // Reference to the User model
      required: true,
    },
    exp_text: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,  // Set default to current timestamp
    },
  },
  {
    timestamps: true,  // Automatically create createdAt and updatedAt fields
  }
);

// Create the Experience model
const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
