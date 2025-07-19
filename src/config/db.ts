import mongoose from "mongoose";

mongoose.set("strictQuery", false);

export async function connectToDatabase(db: string) {
  try {
    await mongoose.connect(db);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
