import fs from "fs/promises"; // Using promises for async file operations
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4
import Video from "../models/Video.js";
import logger from "../utils/logger.js";

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
ffmpeg.setFfprobePath("/usr/bin/ffprobe");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload and convert video to HLS
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    logger.info("File path: " + req.file.path);

    const lessonId = uuidv4();
    const outputDir = path.join(__dirname, "../uploads/hls", lessonId);
    const hlsPath = path.join(outputDir, "index.m3u8");

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    ffmpeg(req.file.path)
      .addOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 4",
        "-hls_list_size 0",
        "-f hls",
        `-hls_segment_filename ${outputDir}/segment%03d.ts`,
      ])
      .output(hlsPath)
      .on("end", async () => {
        logger.info("HLS conversion finished successfully");

        const video = new Video({
          originalName: req.file.originalname,
          storedName: "index.m3u8",
          path: `/uploads/hls/${lessonId}/index.m3u8`, // ✅ Store relative path
          size: req.file.size,
          mimetype: "application/x-mpegURL",
          uploadDate: new Date(),
        });

        try {
          const savedVideo = await video.save();
          await fs.unlink(req.file.path); // Clean up the original uploaded file
          logger.info(`Deleted original file: ${req.file.path}`);
          res.status(201).json(savedVideo);
        } catch (saveErr) {
          logger.error("Error saving video metadata:", saveErr);
          res.status(500).json({
            message: "Error saving video metadata",
            error: saveErr.message,
          });
          // Optionally, clean up the HLS files if metadata saving fails
          await fs.rm(outputDir, { recursive: true, force: true });
        }
      })
      .on("error", async (err) => {
        logger.error("Error during HLS conversion:", err);
        await fs.rm(outputDir, { recursive: true, force: true }); // Clean up the created HLS directory on error
        await fs.unlink(req.file.path); // Clean up the original uploaded file
        logger.info(`Deleted original file (on error): ${req.file.path}`);
        res.status(500).json({
          message: "Error during video processing",
          error: err.message,
        });
      })
      .run();
  } catch (err) {
    logger.error("Upload Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.status(200).json(videos);
  } catch (err) {
    logger.error("Fetch Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const filePath = path.resolve(video.path);
    try {
      await fs.access(filePath); // Check if the file exists
      await fs.unlink(filePath); // Delete the video file
      logger.info(`Deleted file: ${filePath}`);

      // Optionally, delete the entire HLS directory
      const hlsDir = path.dirname(filePath);
      if (hlsDir.includes("/hls/")) {
        await fs.rm(hlsDir, { recursive: true, force: true });
        logger.info(`Deleted HLS directory: ${hlsDir}`);
      }
    } catch (unlinkErr) {
      logger.error("Error deleting file:", unlinkErr);
      // We might still want to delete the database record even if the file deletion fails
    }

    await video.deleteOne();
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (err) {
    logger.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
