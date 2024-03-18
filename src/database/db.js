import mongoose from "mongoose";
const DB_CONNECTION = `${process.env.MONGO_URL}/${process.env.MONGO_COLLECTION}`;

const connectDatabase = async () => {
  try {
    await mongoose.connect(DB_CONNECTION);
    console.log("Connected to Mongo Server");
  } catch (error) {
    console.log("Failed to connect to Mongo Server");
    process.exit(1);
  }
};

export default connectDatabase;
