const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addOrRemoveLike } = require("../controllers/commentController");
const commentModel = require("../models/commentModel");
const crudCreator = require("../services/crudCreator");

const commentController = crudCreator(commentModel, {
  populateFields: ["author", "likes", "media.item"],
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - media
 *         - author
 *         - text
 *       properties:
 *         media:
 *           type: object
 *           properties:
 *             item:
 *               type: string
 *               example: "64f68ad62f97c4e2c76d5a88"
 *             itemType:
 *               type: string
 *               enum: [Reel, Publication]
 *               example: "Reel"
 *         author:
 *           type: string
 *           example: "64f689f12f97c4e2c76d5a80"
 *         text:
 *           type: string
 *           example: "Nice post!"
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f689f12f97c4e2c76d5a80"]
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints for managing comments
 */

/**
 * @swagger
 * /api/v1/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'

 * /api/v1/comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: The requested comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Updated comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     responses:
 *       204:
 *         description: Comment deleted

 * /api/v1/comments/{id}/like:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comment liked"
 */


router.get("/", commentController.getAll);
router.get("/:id", commentController.getOne);
router.post("/", authMiddleware, commentController.create);
router.put("/:id", authMiddleware, commentController.update);
router.delete("/:id", authMiddleware, commentController.remove);
router.post("/:id/like", authMiddleware, addOrRemoveLike);

module.exports = router;
