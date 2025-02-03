import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import Pool from "./db.js";
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

// Test database connection
Pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Database connected:", result.rows);
  });
});

// Add a simple route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the Blog App API");
});

// server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
