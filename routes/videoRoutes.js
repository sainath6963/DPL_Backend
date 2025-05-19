import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // Using promises for async fs
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import { getAllVideos, deleteVideo } from "../controller/videoController.js";
import Video from "../models/Video.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdir(uploadDir, { recursive: true }).catch((err) =>
  logger.error("Error creating upload directory:", err)
);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// File filter for allowed MIME types
const fileFilter = (_, file, cb) => {
  const allowed = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: process.env.FILE_SIZE_LIMIT || 1 * 1024 * 1024 * 1024 },
  fileFilter,
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: `Unexpected error: ${err.message}` });
  }
  next();
};

const router = Router();

// Helper function to delete file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.info(`Deleted file: ${filePath}`);
  } catch (err) {
    logger.error("Error deleting file:", err);
  }
};

// Process and save video
const processAndSaveVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file uploaded." });
  }

  const inputPath = path.resolve(req.file.path);
  const outputFilename = `transcoded-${req.file.filename}`;
  const outputPath = path.resolve(
    path.join(path.dirname(inputPath), outputFilename)
  );

  ffmpeg(inputPath)
    .output(outputPath)
    .videoCodec("libx264")
    .audioCodec("aac")
    .on("end", async () => {
      try {
        const video = new Video({
          originalName: req.file.originalname,
          storedName: outputFilename,
          path: outputPath,
          size: req.file.size,
          mimetype: req.file.mimetype,
        });

        await video.save();
        logger.info(`Video saved: ${video._id}`);

        await deleteFile(inputPath); // Delete original file

        res
          .status(201)
          .json({ message: "Upload & transcoding successful", video });
      } catch (err) {
        logger.error("DB Save Error:", err);
        res.status(500).json({ error: "Error saving video info" });
      }
    })
    .on("error", (err) => {
      logger.error("Transcoding Error:", err);
      res
        .status(500)
        .json({ error: `Error during video processing: ${err.message}` });
    })
    .run();
};

// Process and convert to HLS
const processAndConvertToHls = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file uploaded." });
  }

  const lessonId = uuidv4();
  const inputPath = path.resolve(req.file.path);
  const outputDir = path.resolve(__dirname, `../uploads/hls/${lessonId}`);
  const hlsPath = path.join(outputDir, "index.m3u8");

  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (err) {
    logger.error("Error creating HLS output directory:", err);
    return res.status(500).json({ error: "Error creating directory for HLS" });
  }

  ffmpeg(inputPath)
    .addOptions([
      "-profile:v baseline",
      "-level 3.0",
      "-start_number 0",
      `-hls_time ${process.env.HLS_SEGMENT_DURATION || 10}`,
      "-hls_list_size 0",
      "-f hls",
      `-hls_segment_filename ${outputDir}/segment%03d.ts`,
    ])
    .output(hlsPath)
    .on("end", async () => {
      try {
        const video = new Video({
          originalName: req.file.originalname,
          storedName: "index.m3u8",
          path: hlsPath,
          size: req.file.size,
          mimetype: "application/x-mpegURL",
        });

        await video.save();
        logger.info(`HLS Video saved: ${video._id}`);

        await deleteFile(inputPath); // Delete original file

        res.status(201).json({
          message: "Converted to HLS",
          url: `/uploads/hls/${lessonId}/index.m3u8`,
        });
      } catch (err) {
        logger.error("HLS DB Save Error:", err);
        res.status(500).json({ error: "Error saving HLS video info" });
      }
    })
    .on("error", (err) => {
      logger.error("HLS Error:", err);
      res.status(500).json({ error: err.message });
    })
    .run();
};

// Routes
router.post(
  "/upload",
  upload.single("video"),
  handleMulterError,
  processAndSaveVideo
);
router.post(
  "/upload/hls",
  upload.single("video"),
  handleMulterError,
  processAndConvertToHls
);
router.get("/", getAllVideos);
router.delete("/:id", deleteVideo);

export default router;
