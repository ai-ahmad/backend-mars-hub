const router = require("express").Router();
const reelsModel = require("../models/reelsModel");
const crudCreator = require("../services/crudCreator");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const {addOrRemoveLike, addView} = require("../controllers/reelsController")

const upload = uploadMiddleware("reels", [{ name: "media", maxCount: 1 }]);

const reelsController = crudCreator(reelsModel, {
  useMedia: true,
  mediaFields: ["media"],
  mediaFolder: "reels",
  populateFields: ["author", "comments"],
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Reel:
 *       type: object
 *       required:
 *         - author
 *         - media
 *         - type
 *       properties:
 *         author:
 *           type: string
 *           format: ObjectId
 *           description: ID пользователя, который загрузил рил
 *         description:
 *           type: string
 *           description: Описание рила
 *         media:
 *           type: string
 *           format: binary
 *           description: Ссылка на изображение или видео
 *         type:
 *           type: string
 *           enum: [video, image]
 *           description: Тип медиафайла (видео или изображение)
 *         hashtags:
 *           type: array
 *           items:
 *             type: string
 *           description: Хэштеги, связанные с рилом
 *         isPublic:
 *           type: boolean
 *           description: Публичность рила (виден всем или только владельцу)
 *           default: true
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: ID пользователей, поставивших лайк
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: ID комментариев к рилу
 *         views:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: ID пользователей, которые посмотрели рил
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания рила
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления рила
 */

/**
 * @swagger
 * /api/v1/reels:
 *   get:
 *     summary: Получить все рилы
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: Успешный ответ с массивом рилов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reel'
 */
router.get("/", reelsController.getAll);

/**
 * @swagger
 * /api/v1/reels/{id}:
 *   get:
 *     summary: Получить рил по ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID рила
 *     responses:
 *       200:
 *         description: Успешный ответ с объектом рила
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Рил не найден
 */
router.get("/:id", reelsController.getOne);

/**
 * @swagger
 * /api/v1/reels:
 *   post:
 *     summary: Создать новый рил
 *     tags: [Reels]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *                 format: ObjectId
 *                 description: ID пользователя, который загружает рил
 *               description:
 *                 type: string
 *                 description: Описание рила
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Медиафайл (изображение или видео)
 *               type:
 *                 type: string
 *                 enum: [video, image]
 *                 description: Тип загружаемого файла
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Хэштеги для рила
 *     responses:
 *       201:
 *         description: Рил успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 */
router.post("/", [authMiddleware, upload], reelsController.create);

/**
 * @swagger
 * /api/v1/reels/{id}:
 *   put:
 *     summary: Обновить рил по ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID рила
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Описание рила
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Обновленный медиафайл (изображение или видео)
 *               type:
 *                 type: string
 *                 enum: [video, image]
 *                 description: Тип загружаемого файла
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Хэштеги для рила
 *     responses:
 *       200:
 *         description: Рил успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Рил не найден
 */
router.put("/:id", [authMiddleware, upload], reelsController.update);

/**
 * @swagger
 * /api/v1/reels/{id}:
 *   delete:
 *     summary: Удалить рил по ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID рила
 *     responses:
 *       200:
 *         description: Рил успешно удален
 *       404:
 *         description: Рил не найден
 */
router.delete("/:id", authMiddleware, reelsController.remove);

/**
 * @swagger
 * /api/v1/reels/{id}/like:
 *   post:
 *     summary: Добавить или удалить лайк на рил
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID рила
 *     responses:
 *       200:
 *         description: Лайк добавлен или удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "like added or removed"
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Рил не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post("/:id/like", authMiddleware, addOrRemoveLike);

/**
 * @swagger
 * /api/v1/reels/{id}/view:
 *   post:
 *     summary: Добавить просмотр рила
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID рила
 *     responses:
 *       200:
 *         description: Просмотр добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "view added"
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Рил не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post("/:id/view", authMiddleware, addView);

module.exports = router;
