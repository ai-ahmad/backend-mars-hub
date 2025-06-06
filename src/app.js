require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const swaggerDocs = require("./config/swaggerConfig");
const connectDB = require("./config/database");

const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const reelsRouter = require("./routes/reelsRouter");
const commentRouter = require("./routes/commentRouter");
const publicationRouter = require("./routes/publicationRouter");
const roomRoutes = require("./routes/roomRouter")
const messengerRouter = require("./routes/messangerRouter")

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Узгоджуємо шлях із multer у publicationRouter.js
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Змінено на "uploads" для ясності

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// SWAGGER
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  req.io = app.get("io");
  if (!req.io) {
    console.warn("⚠️ WebSocket io не доступен в запросе!");
  }
  next();
});

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reels", reelsRouter);
app.use("/api/v1/publications", publicationRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/messangers", messengerRouter);
app.use("/api/v1/rooms", roomRoutes);

module.exports = app;