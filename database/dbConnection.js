import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "DPL_REGISTRATION",
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log(` Database connected successfully`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
