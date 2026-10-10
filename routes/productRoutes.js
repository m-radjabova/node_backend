import express from "express";
import Joi from "joi";
import Product from "../models/Product.js";

const router = express.Router();

const filterValidation = Joi.object({
  name: Joi.string().trim(),
  category: Joi.string().trim(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  brand: Joi.string().trim(),
  tag: Joi.string().trim(),
  sort: Joi.string().valid("price", "-price"),
});

router.get("/filter", async (req, res) => {
  try {
    const { error, value } = filterValidation.validate(req.query);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { name, category, minPrice, maxPrice, brand, tag, sort } = value;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (brand) {
      filter.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    if (tag) {
      filter.tags = { $regex: `^${tag}$`, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gt = minPrice;
      }

      if (maxPrice) {
        filter.price.$lt = maxPrice;
      }
    }

    let productsQuery = Product.find(filter);

    if (sort) {
      const sortOrder = sort === "price" ? 1 : -1;
      productsQuery = productsQuery.sort({ price: sortOrder });
    }

    const products = await productsQuery;

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
