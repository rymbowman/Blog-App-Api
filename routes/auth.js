import express from "express";
import {
  login,
  logout,
  register,
  resetPassword,
  sendPasswordResetEmail,
} from "../controllers/auth.js";

// router
const router = express.Router();

// routes

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", sendPasswordResetEmail);
router.post("/reset-password/:token", resetPassword);

// export
export default router;
