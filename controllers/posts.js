import Pool from "../db.js";

export const getPosts = async (req, res) => {
  const { user_id } = req.query;
  try {
    const posts = await Pool.query("SELECT * FROM posts WHERE user_id = $1", [
      user_id,
    ]);
    res.status(200).send(posts.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    res.status(200).send(post.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const createPost = async (req, res) => {
  const { title, description, content, image, category, user_id } = req.body;
  const word_count = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  try {
    const newPost = await Pool.query(
      "INSERT INTO posts (title, description, content, image, category, user_id, word_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, content, image, category, user_id, word_count]
    );
    res.status(201).send(newPost.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, image, category } = req.body;
  const word_count = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  try {
    const updatePost = await Pool.query(
      "UPDATE posts SET title = $1, description = $2, content = $3, image = $4, category = $5, word_count = $6 WHERE id = $7 RETURNING *",
      [title, description, content, image, category, word_count, id]
    );
    if (updatePost.rows.length === 0) {
      return res.status(404).send({ error: "Post not found" });
    }
    res.status(200).send(updatePost.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deletePost = await Pool.query("DELETE FROM posts WHERE id = $1", [
      id,
    ]);
    if (deletePost.rowCount === 0) {
      return res.status(404).send({ error: "Post not found" });
    }
    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};
