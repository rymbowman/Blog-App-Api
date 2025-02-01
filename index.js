import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import authRouter from "./routes/auth.js";
import commentsRouter from "./routes/comments.js";

dotenv.config();
// app
const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// routes
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/auth", authRouter);
app.use("/api", commentsRouter);

// Default route
app.get("/", (req, res) => {
  console.log("Received request for /");
  res.send("Welcome to the Blog App API");
});

// The "catchall" handler: for any request that doesn't match one above, send back a 404 response
app.use((req, res, next) => {
  console.log(`Request for ${req.originalUrl} did not match any routes`);
  res.status(404).json({ message: "Not Found" });
});

// server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
