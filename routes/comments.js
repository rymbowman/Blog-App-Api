import express from "express";
import {
  createComment,
  deleteComment,
  getComments,
} from "../controllers/comments.js";

// router
const router = express.Router();

// routes
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", createComment);
router.delete("/comments/:id", deleteComment);

// export
export default router;
