require("dotenv").config();
const auth = require("./authMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("Connected to DB:", mongoose.connection.name);
  })
  .catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});
// ------------------ API ROUTES ------------------

// 1️⃣ GET - Fetch all transactions
app.get("/api/transactions", auth, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user });
  res.json(transactions);
});

// 2️⃣ POST - Add new transaction
app.post("/api/transactions", auth, async (req, res) => {
  const transaction = new Transaction({
    ...req.body,
    user: req.user,
  });

  await transaction.save();
  res.json(transaction);
});

// 3️⃣ DELETE - Delete transaction by ID
app.delete("/api/transactions/:id", auth, async (req, res) => {
  await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user,
  });

  res.json({ message: "Transaction Deleted" });
});

// REGISTER USER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// LOGIN USER
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "mysecret123", {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4️⃣ UPDATE - Update transaction
app.put("/api/transactions/:id", auth, async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user, // ensures user can update only their own data
      },
      req.body,
      { new: true }, // returns updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
