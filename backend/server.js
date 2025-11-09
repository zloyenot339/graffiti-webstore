import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "usersdb",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cd) => {
    cd(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_ACCESS_SECRET || "accesssecret",
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_REFRESH_SECRET || "refreshsecret",
    { expiresIn: "7d" }
  );
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // сделать проверку на имя

  const checkUserSql = "SELECT * FROM login WHERE email = ?";
  db.query(checkUserSql, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Databese error" });
    }

    if (result.length > 0) {
      console.log(err);
      return res.status(400).json({ error: "Email already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql =
      "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
    db.query(
      insertSql,
      [name, email, hashedPassword],
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Error adding user" });
        }

        res.status(201).json({
          message: "User successfully registered",
          id: data.insertId,
        });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const selectSql = "SELECT * FROM login WHERE email = ? ";

  db.query(selectSql, [email], async (err, data) => {
    console.log("DB result:", data, "Error:", err);
    if (err) return res.status(500).json({ error: "Database error" });
    if (data.length === 0)
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    const user = data[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User successfully signed in",
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
});

app.post("/refresh_token", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || "refreshsecret",
    (err, user) => {
      if (err)
        return res.status(403).json({ error: "Invalid token" });
      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    }
  );
});

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Auth header:", authHeader);
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET || "accesssecret",
    (err, user) => {
      if (err)
        return res
          .status(401)
          .json({ error: "Token expired or invalid" });
      req.user = user;
      console.log("Verified user:", req.user);
      next();
    }
  );
};

app.get("/protected", verifyAccessToken, (req, res) => {
  res.json({
    message: "JWT works! Access allowed",
    user: req.user,
  });
});

app.post(
  "/addGraffiti",
  verifyAccessToken,
  upload.single("image"),
  (req, res) => {
    console.log("Creating graffiti by user:", req.user.name);
    const {
      name,
      style,
      description,
      likes = 0,
      price = 0,
      quantity = 0,
    } = req.body;
    const createdBy = req.user.name;
    const image = req.file ? req.file.filename : null;

    const checkNameSql = "SELECT * FROM graffiti WHERE name = ?";
    db.query(checkNameSql, [name], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Databese error" });
      }
      if (result.length > 0) {
        console.log(err);
        return res
          .status(400)
          .json({ error: "Graffiti name already exist" });
      }
      const sql =
        "INSERT INTO graffiti (image, name, style, description, likes, price, quantity, createdBy) VALUES (?,?,?,?,?,?,?,?)";
      db.query(
        sql,
        [
          image,
          name,
          style,
          description,
          Number(likes),
          Number(price),
          Number(quantity),
          createdBy,
        ],
        (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
          }
          res.status(201).json({
            message: "Your form was added successfully",
            id: data.insertId,
          });
        }
      );
    });
  }
);

app.get("/graffiti", (req, res) => {
  const sql = "SELECT * FROM graffiti";
  db.query(sql, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  });
});

app.get("/", (req, res) => {
  res.send("Server works correctly");
});

const port = 5000;
app.listen(port, "0.0.0.0", () =>
  console.log(
    `Connection was created, server listening on port: ${port}`
  )
);

app.get("/login", (req, res) => {
  const page = parseInt(req.query._page, 10) || 1;
  const limit = parseInt(req.query._limit, 10) || 25;
  const offset = (page - 1) * limit;

  const sql = "SELECT id, name, email FROM login LIMIT ? OFFSET ?";
  db.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error("Database error", err);
      return res.status(500).json({ message: "Server error" });
    }

    db.query(
      "SELECT COUNT(*) AS count FROM login",
      (countErr, countResults) => {
        if (countErr) {
          console.error("Error counting users", countErr);
          return res.status(500).json({ message: "Srrver error" });
        }

        const totalItems = countResults[0].count;
        res.json({ data: results, totalItems });
      }
    );
  });
});

// бля у меня дохуище колбек хеллов нужо будет исправить

app.post("/cart/add", verifyAccessToken, async (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  const [existing] = await db
    .promise()
    .query(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );
  if (existing.length > 0) {
    await db
      .promise()
      .query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?",
        [user_id, product_id]
      );
  } else {
    await db
      .promise()
      .query(
        "INSERT INTO cart_items (user_id, product_id) VALUES (?, ?)",
        [user_id, product_id]
      );
  }
  res.json({
    message: "Access, your product was added to shopping cart",
  });
});

app.get("/cart", verifyAccessToken, async (req, res) => {
  const user_id = req.user.id;
  const [cart] = await db.promise().query(
    `SELECT c.id AS cart_id, c.quantity, c.product_id, p.name, p.price
     FROM cart_items c
     JOIN graffiti p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [user_id]
  );
  res.json(cart);
});

app.delete("/cart/:cartId", verifyAccessToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const cartId = Number(req.params.cartId);

    const [result] = await db
      .promise()
      .query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [
        cartId,
        user_id,
      ]);

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Product wasn't found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
  "/create-checkout-session",
  verifyAccessToken,
  async (req, res) => {
    try {
      const { cartItems } = req.body;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel",
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: "Payment failed" });
    }
  }
);

app.post("/clear-cart", verifyAccessToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    await db
      .promise()
      .query("DELETE FROM cart_items WHERE user_id = ?", [user_id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

app.post("/like/:id", verifyAccessToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const checkSql =
    "SELECT * FROM user_likes WHERE user_id = ? AND graffiti_id = ?";
  db.query(checkSql, [userId, id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) {
      return res
        .status(400)
        .json({ error: "You already liked this post" });
    }

    const insertSql =
      "INSERT INTO user_likes (user_id, graffiti_id) VALUES (?, ?)";
    db.query(insertSql, [userId, id], (err2) => {
      if (err2)
        return res.status(500).json({ error: "Database error" });

      const updateSql =
        "UPDATE graffiti SET likes = likes + 1 WHERE id = ?";
      db.query(updateSql, [id], (err3) => {
        if (err3)
          return res.status(500).json({ error: "Database error" });
        res.json({ message: "Like added successfully" });
      });
    });
  });
});

app.get("/user-posts", verifyAccessToken, async (req, res) => {
  const userName = req.user.name;

  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT id, image, name, style, description, likes, price, quantity FROM graffiti WHERE createdBy = ?`,
        [userName]
      );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete(
  "/user-posts/:graffitiID",
  verifyAccessToken,
  async (req, res) => {
    try {
      const userName = req.user.name;
      const graffitiID = Number(req.params.graffitiID);

      const [result] = await db
        .promise()
        .query(
          "DELETE FROM graffiti WHERE id = ? AND createdBy = ?",
          [graffitiID, userName]
        );

      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Post not found or access denied" });

      res.json({ message: "Post deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
);

app.get("/user-likes", verifyAccessToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT g.id, g.image, g.name, g.style, g.description, g.likes, g.price, g.quantity 
        FROM graffiti g 
        JOIN user_likes ul ON g.id = ul.graffiti_id
        WHERE ul.user_id = ?`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete(
  "/user-likes/:graffitiID",
  verifyAccessToken,
  async (req, res) => {
    try {
      const user_id = Number(req.user.id);
      const graffitiID = Number(req.params.graffitiID);

      const [result] = await db
        .promise()
        .query(
          "DELETE FROM user_likes WHERE graffiti_id = ? AND user_id = ?",
          [graffitiID, user_id]
        );

      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Like wasn't found " });

      await db
        .promise()
        .query("UPDATE graffiti SET likes = likes - 1 WHERE id = ?", [
          graffitiID,
        ]);

      res.json({ message: "Like deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
);
