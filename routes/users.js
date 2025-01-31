import express from "express";
import { getUser, getUsers, updateUser } from "../controllers/users.js";

// router
const router = express.Router();

// routes
router.get("/", getUsers);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);

// export
export default router;
