import mongoose from "mongoose";
 
export const databaseConnection = async () => {
    try {
      await mongoose.connect("mongodb://mongo_db:27017/codeblue");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB", error);
      throw error
    }
  };



export default databaseConnection