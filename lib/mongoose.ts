import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    return console.log("Missing MONGODB_URL");
  }

  if (isConnected) {
    // return console.log("MONGODB is already connected!");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "n-gvlh",
    });

    isConnected = true;

    // console.log("MongoDB is connected!");cl
  } catch (error) {
    console.log(error);
  }
};
