const router = require("express").Router();
const crudCreator = require("../services/crudCreator");
const userModel = require("../models/userModel");
const { updateUser, addFollowing, addSaved, updateUserStatus } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

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
 *         reputation:
 *           type: number
 *           description: Репутация пользователя
 *           default: 0
 *         grade:
 *           type: string
 *           enum: [teamleader, senior, middle, junior, intern]
 *           description: Ранг пользователя
 *           default: intern
 *         status:
 *           type: string
 *           enum: [online, offline]
 *           description: Статус пользователя
 *           default: offline
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: Роль пользователя
 *         publications:
 *           type: array
 *           items:
 *             type: string
 *           description: Публикации пользователя
 *         reels:
 *           type: array
 *           items:
 *             type: string
 *           description: Рилсы пользователя
 *         saved:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *               itemType:
 *                 type: string
 *                 enum: [Reel, Publication]
 *           description: Сохраненные посты и рилcы
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
 *         reputation: 0
 *         grade: "intern"
 *         status: "offline"
 *         role: "user"
 *         publications: []
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


/**
 * @swagger
 * /api/v1/users/follow/{followingId}:
 *   post:
 *     summary: Add a following user
 *     tags: [Users]
 *     description: Adds another user to the following list of the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow.
 *     responses:
 *       200:
 *         description: Following added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 following:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Following ID is required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/users/status:
 *   put:
 *     summary: Update user status
 *     tags: [Users]
 *     description: Updates the status of the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: New status for the user (online, offline).
 *     responses:
 *       200:
 *         description: User status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Status is required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/users/saved:
 *   post:
 *     summary: Add a saved item
 *     tags: [Users]
 *     description: Saves an item for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to be saved.
 *       - in: query
 *         name: itemType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of the item (e.g., post, product, etc.).
 *     responses:
 *       200:
 *         description: Item added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 saved:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item:
 *                         type: string
 *                       itemType:
 *                         type: string
 *       400:
 *         description: Item ID and item type are required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.put("/update-status", authMiddleware, updateUserStatus)
router.post("/add-saved", authMiddleware, addSaved)
router.post("/add-following/:followingId", authMiddleware, addFollowing)

router.get("/", userCrud.getAll);
router.get("/:id", userCrud.getOne);
router.put("/", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, userCrud.remove);


// router.put("/update-profile-photo", updateProfilePhoto)

module.exports = router;
