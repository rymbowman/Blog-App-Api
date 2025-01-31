import Pool from "../db.js";

export const getUsers = async (req, res) => {
  try {
    const users = await Pool.query("SELECT * FROM users");
    if (users.rows.length === 0) {
      return res.status(404).send({ error: "No users found" });
    }
    res.status(200).send(users.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, username, password, profile_img, bio } =
    req.body;

  try {
    const updateUser = await Pool.query(
      "UPDATE users SET firstname = $1, lastname = $2, email = $3, username = $4, password = $5, profile_img = $6, bio = $7 WHERE id = $8 RETURNING *",
      [firstname, lastname, email, username, password, profile_img, bio, id]
    );
    if (updateUser.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(updateUser.rows[0]);
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};
