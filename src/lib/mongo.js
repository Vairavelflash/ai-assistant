import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://username:mongopassword@cluster0.rvuwoml.mongodb.net/?appName=Cluster0",
    );
    console.log("✅ MongoDB Atlas Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
