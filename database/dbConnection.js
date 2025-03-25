import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(
      "mongodb:mongodb+srv://sainathbalkawade7:sainathbalkawade7@cluster0.opneb.mongodb.net/?retryWrites=true",
      {
        dbName: "DPL_REGISTRATION",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(` Database connected successfully`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
