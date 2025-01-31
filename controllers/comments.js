import Pool from "../db.js";

export const getComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Pool.query(
      `SELECT comments.*, users.username 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.post_id = $1`,
      [postId]
    );
    if (comments.rowCount === 0) {
      return res.status(404).send({ error: "No comments found" });
    }
    res.status(200).send(comments.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const createComment = async (req, res) => {
  const { content, user_id, post_id } = req.body;
  try {
    const newComment = await Pool.query(
      "INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *",
      [content, user_id, post_id]
    );
    res.status(201).send(newComment.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteComment = await Pool.query(
      "DELETE FROM comments WHERE id = $1",
      [id]
    );
    if (deleteComment.rowCount === 0) {
      return res.status(404).send({ error: "Comment not found" });
    }
    res.status(200).send({ message: "Comment deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};
