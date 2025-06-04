const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Import route
const productRoutes = require("./routes/product.route");
const userRoutes = require("./routes/user.route");
const cartRoutes = require("./routes/cart.route");
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Đặt prefix rõ ràng cho từng route
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
