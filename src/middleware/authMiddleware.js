require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Проверяем наличие заголовка Authorization и формата Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Извлекаем токен из заголовка
  const token = authHeader?.split(" ")[1];

  try {
    // Проверяем и декодируем JWT-токен
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "your_secret_key"
    );
    req.user = decoded; // Сохраняем декодированные данные пользователя в req.user
    next(); // Переходим к следующему обработчику
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;