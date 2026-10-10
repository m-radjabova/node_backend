// import express from "express";
// import Joi from "joi";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { uid as Uid } from "uid";
// import { products } from "./data/products.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const app = express();
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const fileName = Date.now() + path.extname(file.originalname);

//     cb(null, fileName);
//   },
// });

// const upload = multer({
//   storage: storage,
// });

// function validateProduct(product) {
//   const schema = Joi.object({
//     name: Joi.string().min(3).required(),

//     category: Joi.string().min(3).required(),

//     price: Joi.number().min(0).required(),

//     description: Joi.string().min(3).required(),
//   });

//   return schema.validate(product);
// }

// function getProductById(id) {
//   return products.find((product) => {
//     return String(product.id) === String(id);
//   });
// }

// function searchProducts(productsList, search) {
//   if (!search) {
//     return productsList;
//   }
//   const searchText = search.toLowerCase();
//   return productsList.filter((product) => {
//     return (
//       product.name.toLowerCase().includes(searchText) ||
//       product.description.toLowerCase().includes(searchText)
//     );
//   });
// }

// function filterByCategory(productsList, category) {
//   if (!category) {
//     return productsList;
//   }

//   return productsList.filter((product) => {
//     return product.category.toLowerCase() === category.toLowerCase();
//   });
// }

// function filterByMinPrice(productsList, minPrice) {
//   if (!minPrice) {
//     return productsList;
//   }

//   return productsList.filter((product) => {
//     return product.price >= Number(minPrice);
//   });
// }

// function filterByMaxPrice(productsList, maxPrice) {
//   if (!maxPrice) {
//     return productsList;
//   }

//   return productsList.filter((product) => {
//     return product.price <= Number(maxPrice);
//   });
// }

// function paginateProducts(productsList, page, limit) {
//   const startIndex = (page - 1) * limit;

//   const endIndex = startIndex + limit;

//   return productsList.slice(startIndex, endIndex);
// }

// function getTotalPages(totalProducts, limit) {
//   return Math.ceil(totalProducts / limit);
// }

// function getCategories() {
//   const categories = products.map((product) => {
//     return product.category;
//   });

//   const uniqueCategories = [...new Set(categories)];

//   return uniqueCategories;
// }
// function createProduct(data, image) {
//   const product = {
//     id: Uid(),

//     name: data.name,

//     category: data.category,

//     price: Number(data.price),

//     description: data.description,

//     image: image,
//   };

//   products.push(product);

//   return product;
// }

// function updateProduct(product, data, image) {
//   product.name = data.name;

//   product.category = data.category;

//   product.price = Number(data.price);

//   product.description = data.description;

//   if (image) {
//     product.image = image;
//   }

//   return product;
// }

// function deleteImage(imagePath) {
//   if (!imagePath) {
//     return;
//   }
//   if (!imagePath.startsWith("/uploads/")) {
//     return;
//   }

//   const fullPath = path.join(__dirname, imagePath);

//   if (fs.existsSync(fullPath)) {
//     fs.unlinkSync(fullPath);
//   }
// }

// function deleteProduct(id) {
//   const product = getProductById(id);
//   if (!product) {
//     return null;
//   }
//   deleteImage(product.image);
//   const productIndex = products.findIndex((item) => {
//     return String(item.id) === String(id);
//   });
//   products.splice(productIndex, 1);

//   return product;
// }

// app.get("/products", (req, res) => {
//   const search = req.query.search || "";

//   const category = req.query.category || "";

//   const minPrice = req.query.minPrice || "";

//   const maxPrice = req.query.maxPrice || "";

//   const page = parseInt(req.query.page) || 1;

//   const limit = parseInt(req.query.limit) || 5;

//   let result = products;

//   result = searchProducts(result, search);
//   result = filterByCategory(result, category);
//   result = filterByMinPrice(result, minPrice);
//   result = filterByMaxPrice(result, maxPrice);
//   const totalProducts = result.length;
//   const totalPages = getTotalPages(totalProducts, limit);
//   result = paginateProducts(result, page, limit);

//   res.send({
//     currentPage: page,
//     totalPages: totalPages,
//     totalProducts: totalProducts,
//     limit: limit,
//     products: result,
//   });
// });

// app.get("/products/:id", (req, res) => {
//   const id = req.params.id;
//   const product = getProductById(id);
//   if (!product) {
//     return res.status(404).send("Product not found");
//   }
//   res.send(product);
// });

// app.post(
//   "/products",

//   upload.single("image"),

//   (req, res) => {
//     const { error } = validateProduct(req.body);
//     if (error) {
//       if (req.file) {
//         const imagePath = `/uploads/${req.file.filename}`;
//         deleteImage(imagePath);
//       }
//       return res.status(400).send(error.details[0].message);
//     }
//     if (!req.file) {
//       return res.status(400).send("Image yuklanishi kerak");
//     }
//     const image = `/uploads/${req.file.filename}`;
//     const product = createProduct(req.body, image);
//     res.status(201).send(product);
//   },
// );

// app.put(
//   "/products/:id",
//   upload.single("image"),
//   (req, res) => {
//     const id = req.params.id;
//     const product = getProductById(id);
//     if (!product) {
//       if (req.file) {
//         const uploadedImage = `/uploads/${req.file.filename}`;
//         deleteImage(uploadedImage);
//       }
//       return res.status(404).send("Product not found");
//     }
//     const { error } = validateProduct(req.body);
//     if (error) {
//       if (req.file) {
//         const uploadedImage = `/uploads/${req.file.filename}`;
//         deleteImage(uploadedImage);
//       }
//       return res.status(400).send(error.details[0].message);
//     }
//     let image = null;
//     if (req.file) {
//       deleteImage(product.image);
//       image = `/uploads/${req.file.filename}`;
//     }
//     const updatedProduct = updateProduct(product, req.body, image);
//     res.send(updatedProduct);
//   },
// );

// app.delete("/products/:id", (req, res) => {
//   const id = req.params.id;
//   const deletedProduct = deleteProduct(id);
//   if (!deletedProduct) {
//     return res.status(404).send("Product not found");
//   }
//   res.send({
//     message: "Product o'chirildi",
//     product: deletedProduct,
//   });
// });

// app.get("/categories", (req, res) => {
//   const categories = getCategories();
//   res.send(categories);
// });

// app.listen(8000, "127.0.0.1", () => {
//   console.log("Server http://localhost:8000 da ishladi");
// });







// Talabalar boshqaruv tizimi
// Talaba qo‘shish
// Talabani o‘chirish
// Ma'lumotlarini yangilash
// Barcha talabalarni ko‘rish
// Ism yoki guruh bo‘yicha qidirish


// Baholar tizimi
// Talabaning fanlarini saqlash
// Har bir fandan baho qo‘yish
// O‘rtacha bahoni hisoblash
// Eng yuqori natijalarni chiqarish