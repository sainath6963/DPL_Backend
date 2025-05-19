import mongoose from "mongoose";

// Define the allowed MIME types
const allowedMimeTypes = [
  "video/mp4",
  "video/mkv",
  "video/avi",
  "video/mov",
  "application/x-mpegURL",
];

// Define the video schema
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Video",
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimetype: {
      type: String,
      required: true,
      enum: allowedMimeTypes,
    },
    hlsUrl: {
      type: String,
      required: false,
      trim: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create the Video model
const Video = mongoose.model("Video", videoSchema);

export default Video;
