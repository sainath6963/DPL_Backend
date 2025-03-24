import ErrorHandler from "../middleware/error.js";
import { Message } from "../models/messageSchema.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import mongoose from "mongoose";

// ✅ Helper function to validate fields
const validateFields = (body, category) => {
  const {
    fullName,
    email,
    address,
    mobile,
    dob,
    height,
    weight,
    hand,
    bowlerType, // ✅ Updated field name (instead of bowler)
    armCategory,
    fieldCategory,
    adharNo, // Add adharNo
  } = body;

  // ✅ Add validation rules based on category
  const requiredFields = {
    fullName,
    email,
    address,
    mobile,
    dob,
    height,
    weight,
    category,
    fieldCategory,
    adharNo, // Require adharNo
    ...(category === "Batsman" && { hand }),
    ...((category === "Bowler" || category === "All-Rounder") && {
      bowlerType,
      armCategory,
      hand,
    }),
  };

  // ✅ Loop through required fields and validate
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || value === "") {
      throw new ErrorHandler(`Missing required field: ${key}`, 400);
    }
  }

  return {
    fullName: fullName?.trim(),
    email: email?.trim().toLowerCase(),
    address: address?.trim(),
    mobile: mobile?.trim(),
    dob: new Date(dob),
    height: Number(height),
    weight: Number(weight),
    category,
    fieldCategory,
    hand:
      category === "Batsman" || category === "All-Rounder"
        ? hand?.trim()
        : null,
    bowlerType:
      category === "Bowler" || category === "All-Rounder"
        ? bowlerType?.trim()
        : null,
    armCategory:
      category === "Bowler" || category === "All-Rounder"
        ? armCategory?.trim()
        : null,
    adharNo: adharNo?.trim(), //store adharNo
  };
};

// ✅ Send Message Controller (Improved Validation)
export const sendMessage = catchAsyncError(async (req, res, next) => {
  try {
    const category = req.body.category;
    const messageData = validateFields(req.body, category);

    const data = await Message.create(messageData);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Get All Messages Controller
export const getAllMessages = catchAsyncError(async (req, res, next) => {
  const messages = await Message.find().sort({ createdAt: -1 }).lean(); // Improved performance with lean()

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

// ✅ Get Single Message by ID with Validation
export const getMessageById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid ID format.", 400));
  }

  const message = await Message.findById(id).lean();

  if (!message) {
    return next(new ErrorHandler("Message not found.", 404));
  }

  res.status(200).json({
    success: true,
    message,
  });
});

// ✅ Delete Message Controller with Validation
export const deleteMessage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid ID format.", 400));
  }

  const message = await Message.findByIdAndDelete(id);

  if (!message) {
    return next(new ErrorHandler("Registration not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Registration deleted successfully.",
  });
});
