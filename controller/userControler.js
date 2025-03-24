import bcrypt from "bcryptjs";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/UserSchema.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email.", 409));
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword, // Store hashed password
  });

  res.status(201).json({
    success: true,
    message: "Registered successfully!",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    },
  });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide Email and Password", 400));
  }

  // Find user and include password field for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!", 401));
  }

  // Compare the provided password with the stored hashed password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password!", 401));
  }

  // Send response with token and user details (excluding password)
  res.status(200).json({
    success: true,
    message: "Login successful!",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    },
  });
});
