import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully");
  isConnected = true;
};

export default connectDB;
