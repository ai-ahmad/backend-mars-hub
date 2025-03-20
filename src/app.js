require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const swaggerDocs = require("./config/swaggerConfig");
const connectDB = require("./config/database");
const authMiddleware = require("./middleware/authMiddleware");

const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
// const storyRouter = require("./routes/storyRouter");

const publicationRouter = require("./routes/publicationRouter")
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// SWAGGER
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use("/api/v1/users", authMiddleware, userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/pubclication", publicationRouter)
// app.use("/api/v1/stories", authMiddleware, storyRouter);

module.exports = app;
