import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Full name is required!"],
    minLength: [2, "Full name must contain at least 2 characters!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true, // Ensure unique email registration (optional)
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address!"], // Basic email validation
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required!"],
    minLength: [10, "Phone number must contain at least 10 digits!"],
  },
  age: {
    type: String,
    required: [true, "age is required!"], // Ensure teamName is required
    minLength: [2, "age must contain at least 2 characters!"],
  },
  role: {
    type: String,
    required: [true, "role is required!"], // Ensure teamName is required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model("Message", messageSchema);
