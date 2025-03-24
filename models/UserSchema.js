import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Phone Number Required"],
  },
  password: {
    type: String,
    required: [true, "Password Field is Required"],
    minLength: [8, "Password must contain at least 8 characters"],
    select: false, // Hide password by default
  },
});

// ✅ Async compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
