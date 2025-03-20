const router = require("express").Router();
const crudCreator = require("../services/crudCreator");
const userModel = require("../models/userModel");
const { updateUser } = require("../controllers/authController");

const userCrud = crudCreator(userModel, {
  populateFields: ["posts", "reels", "saved.item", "followers", "following"],
});


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstName
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *         username:
 *           type: string
 *           description: Уникальное имя пользователя
 *         password:
 *           type: string
 *           description: Пароль пользователя
 *         firstName:
 *           type: string
 *           description: Имя пользователя
 *         lastName:
 *           type: string
 *           description: Фамилия пользователя
 *         birthdate:
 *           type: string
 *           format: date
 *           description: Дата рождения
 *         location:
 *           type: string
 *           description: Местоположение
 *         email:
 *           type: string
 *           format: email
 *           description: Электронная почта
 *         profileImage:
 *           type: string
 *           description: Ссылка на изображение профиля
 *         bio:
 *           type: string
 *           description: Биография пользователя
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: Роль пользователя
 *         posts:
 *           type: array
 *           items:
 *             type: string
 *           description: Посты пользователя
 *         reels:
 *           type: array
 *           items:
 *             type: string
 *           description: Рилы пользователя
 *         saved:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *               itemType:
 *                 type: string
 *                 enum: [Reel, Post]
 *           description: Сохраненные посты и рилы
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           description: Подписчики
 *         following:
 *           type: array
 *           items:
 *             type: string
 *           description: Подписки
 *       example:
 *         id: "6123456789abcdef01234567"
 *         username: "john_doe"
 *         password: "securepassword"
 *         firstName: "John"
 *         lastName: "Doe"
 *         birthdate: "1990-01-01"
 *         location: "New York"
 *         email: "john.doe@example.com"
 *         profileImage: "/uploads/default-images/profile.png"
 *         bio: "Just a regular user."
 *         role: "user"
 *         posts: []
 *         reels: []
 *         saved: []
 *         followers: []
 *         following: []
 *
 * /api/v1/users:
 *   get:
 *     summary: Получить всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список всех пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   put:
 *     summary: Обновить данные пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *
 * /api/v1/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Успешное удаление
 */

router.get("/", userCrud.getAll);
router.get("/:id", userCrud.getOne);
router.put("/", updateUser);
router.delete("/:id", userCrud.remove);

module.exports = router;
