import express from "express";
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controller/messageController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getAllMessage", getAllMessages);
router.delete("/deleteMessage/:id", deleteMessage);

export default router;
