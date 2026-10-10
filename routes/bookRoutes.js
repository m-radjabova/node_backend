import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.json({
      count: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      message: "Xatolik yuz berdi",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, author, price, year } = req.body;

    const book = await Book.create({
      title,
      author,
      price,
      year,
    });

    res.status(201).json({
      message: "Kitob yaratildi ✅",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Xatolik yuz berdi",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        message: "Kitob topilmadi ❌",
      });
    }
    
    res.json({
      message: "Kitob topildi ✅",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Xatolik yuz berdi",
      error: error.message,
    });
  }
});

export default router;
