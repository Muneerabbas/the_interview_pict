
import mongoose from 'mongoose';

const connectToDatabase = async () => {
    // console.log("Starting MongoDB connection...");
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; 
  }
};

export default connectToDatabase;
