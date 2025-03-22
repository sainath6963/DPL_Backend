import mongoose from "mongoose";

// ✅ Custom date validation
const validateDate = (value) => {
  if (!value || isNaN(new Date(value).getTime())) {
    throw new Error("Invalid date format! Use YYYY-MM-DD.");
  }
};

const messageSchema = new mongoose.Schema({
  formNo: {
    type: String,
    required: [true, "Form number is required!"],
    unique: true, // Ensure unique form numbers
  },
  fullName: {
    type: String,
    required: [true, "Full name is required!"],
    minLength: [2, "Full name must contain at least 2 characters!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address!"],
  },
  address: {
    type: String,
    required: [true, "Address is required!"],
    minLength: [5, "Address must contain at least 5 characters!"],
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required!"],
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required!"],
    validate: {
      validator: validateDate,
      message: "Invalid date format! Use YYYY-MM-DD.",
    },
  },
  height: {
    type: Number,
    required: [true, "Height is required!"],
    min: [50, "Height must be at least 50 cm!"],
  },
  weight: {
    type: Number,
    required: [true, "Weight is required!"],
    min: [20, "Weight must be at least 20 kg!"],
  },
  category: {
    type: String,
    enum: ["Batsman", "Bowler", "All-Rounder"],
    required: [true, "Category is required!"],
  },

  // ✅ Use consistent field names
  hand: {
    type: String,
    enum: ["Right", "Left"],
    required: function () {
      return this.category === "Batsman" || this.category === "All-Rounder";
    },
  },

  bowlerType: {
    type: String,
    enum: ["Fast", "Medium", "Spinner"],
    required: function () {
      return this.category === "Bowler" || this.category === "All-Rounder";
    },
  },

  armCategory: {
    type: String,
    enum: ["Right", "Left"],
    required: function () {
      return this.category === "Bowler" || this.category === "All-Rounder";
    },
  },

  fieldCategory: {
    type: String,
    enum: ["General", "Wicket Keeper"],
    required: [true, "Field category is required!"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Pre-save hook to normalize date format
messageSchema.pre("save", function (next) {
  if (this.dob) {
    this.dob = new Date(this.dob);
  }
  next();
});

export const Message = mongoose.model("Message", messageSchema);
