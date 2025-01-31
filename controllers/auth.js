import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Pool from "../db.js";
import { sendEmail } from "../utils/sendEmail.js";

// Login user
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user exists
    const user = await Pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).send({
        error: "User not found, please try entering credentials again",
      });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).send({ error: "Invalid password" });
    }

    // Create and assign token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set cookie with token in response header
    res.cookie("token", token, { httpOnly: true });
    res.status(200).send(user.rows[0]);
  } catch (error) {
    // Log error and send response
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

// Register user
export const register = async (req, res) => {
  const { firstname, lastname, email, username, password } = req.body;

  // Check if all fields are filled
  if (!firstname || !lastname || !email || !username || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }
  try {
    // Check if email or username already exists
    const emailQuery = await Pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (emailQuery.rows.length > 0) {
      console.error("Email already exists:", email);
      return res.status(400).send({ error: "Email already exists" });
    }

    const usernameQuery = await Pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (usernameQuery.rows.length > 0) {
      console.error("Username already exists:", username);
      return res.status(400).send({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await Pool.query(
      "INSERT INTO users (firstname, lastname, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [firstname, lastname, email, username, hashedPassword]
    );
    // Create and assign token
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).send({ token, user: newUser.rows[0] });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

// Logout user
export const logout = async (req, res) => {
  // Clear cookie on logout
  res.clearCookie("token");
  res.status(200).send({ message: "Logged out successfully" });
};

// Retrieve lost password
export const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }
    // Generate password reset token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await Pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [token, resetTokenExpiry, user.rows[0].id]
    );

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process: ${resetURL}`;

    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).send({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [token, new Date()]
    );
    if (user.rows.length === 0) {
      return res.status(400).send({ error: "Invalid or expired token" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    const updatedUser = await Pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.rows[0].id]
    );
    res.status(201).send(updatedUser.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Database connection error" });
  }
};
