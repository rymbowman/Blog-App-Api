import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
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

// Serve static files from the React app
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "Blog-App-Client/dist")));

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Blog-App-Client/dist", "index.html"));
});

// server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
