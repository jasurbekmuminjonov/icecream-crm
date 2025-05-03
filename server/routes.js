const express = require("express");
const rt = express.Router();

// ✅ Controllerlar
const {
  createUser,
  loginUser,
  getUsers,
} = require("./controllers/userController");

const {
  createProductType,
  getProductTypes,
  updateProductType,
  deleteProductType,
} = require("./controllers/productTypeController");

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("./controllers/productController");

const {
  createSale,
  getSales,
  createPayment,
  deliverSale,
  approveSale, // ✅ Yangi tasdiqlash controller
} = require("./controllers/saleController");

// ✅ Middleware
const { authMiddleware } = require("./middlewares/authMiddleware");

// ✅ User
rt.post("/user/create", authMiddleware, createUser);
rt.post("/user/login", loginUser);
rt.get("/user/get", authMiddleware, getUsers);

// ✅ Product type
rt.post("/product-type/create", authMiddleware, createProductType);
rt.get("/product-type/get", authMiddleware, getProductTypes);
rt.put(
  "/product-type/update/:productTypeId",
  authMiddleware,
  updateProductType
);
rt.delete(
  "/product-type/delete/:productTypeId",
  authMiddleware,
  deleteProductType
);

// ✅ Product
rt.post("/product/create", authMiddleware, createProduct);
rt.get("/product/get", authMiddleware, getProducts);
rt.put("/product/update/:productId", authMiddleware, updateProduct);
rt.delete("/product/delete/:productId", authMiddleware, deleteProduct);

// ✅ Sale
rt.post("/sale/create", authMiddleware, createSale);
rt.get("/sale/get", authMiddleware, getSales);
rt.put("/sale/payment/:saleId", authMiddleware, createPayment);
rt.put("/sale/deliver/:saleId", authMiddleware, deliverSale);
rt.put("/sale/approve/:saleId", authMiddleware, approveSale); // ✅ Yangi qo‘shildi

module.exports = rt;
