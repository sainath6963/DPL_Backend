import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: true, // ✅ Ensures email uniqueness
  },
  phone: {
    type: String, // ✅ Changed from Number to String to prevent data loss
    required: [true, "Phone Number Required"],
  },
  password: {
    type: String,
    required: [true, "Password Field is Required"],
    minLength: [8, "Password must contain at least 8 characters"],
    select: false, // ✅ Ensures password is not returned in queries
  },
});

// Compare password
UserSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
