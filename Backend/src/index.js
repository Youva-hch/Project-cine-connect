import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET manquant dans le .env");
}

app.use(helmet());
app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Token invalide" });
  }
}

app.get("/", (_req, res) => {
  res.send("API CineConnect running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/db-test", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Connexion à la base échouée",
    });
  }
});

app.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "Utilisateur créé",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/users/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/ratings", authenticateToken, async (req, res) => {
  const { imdb_id, rating, review } = req.body;

  if (!imdb_id || !rating) {
    return res.status(400).json({ error: "imdb_id et rating sont requis" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "La note doit être entre 1 et 5" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, imdb_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, imdb_id, rating, review || null]
    );

    res.status(201).json({
      message: "Note ajoutée avec succès",
      rating: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/ratings/:imdbID", async (req, res) => {
  const { imdbID } = req.params;

  try {
    const result = await pool.query(
      `SELECT ratings.id, ratings.imdb_id, ratings.rating, ratings.review, ratings.created_at,
              users.id AS user_id, users.username
       FROM ratings
       JOIN users ON ratings.user_id = users.id
       WHERE ratings.imdb_id = $1
       ORDER BY ratings.created_at DESC`,
      [imdbID]
    );

    res.json({
      imdb_id: imdbID,
      ratings: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/rooms", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rooms ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/rooms", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Le nom du salon est requis" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO rooms (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json({
      message: "Salon créé avec succès",
      room: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/rooms/:id/messages", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT messages.id, messages.content, messages.created_at,
              users.id AS user_id, users.username
       FROM messages
       JOIN users ON messages.user_id = users.id
       WHERE messages.room_id = $1
       ORDER BY messages.created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/rooms/:id/messages", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Le contenu du message est requis" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (room_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.userId, content]
    );

    res.status(201).json({
      message: "Message envoyé avec succès",
      messageData: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
