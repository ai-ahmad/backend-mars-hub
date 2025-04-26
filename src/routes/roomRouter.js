const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  generateInvite,
  joinRoom,
  getMembers,
  addMember,
  removeMember,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Rooms
 *     description: Room management endpoints
 *   - name: Room Members
 *     description: Room members management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The room ID
 *         name:
 *           type: string
 *           description: The name of the room
 *         creator:
 *           type: object
 *           description: The user who created the room
 *         members:
 *           type: array
 *           items:
 *             type: object
 *           description: List of room members
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Room creation date
 *         password_room:
 *           type: string
 *           description: Optional password for the room
 *         inviteToken:
 *           type: string
 *           description: Unique invite token for the room
 *       required:
 *         - name
 *         - creator
 */

/**
 * @swagger
 * /api/v1/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the room
 *               password_room:
 *                 type: string
 *                 description: Optional password for the room
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     summary: Get all rooms for the authenticated user
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the room
 *               password_room:
 *                 type: string
 *                 description: Updated password for the room
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Room deleted
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}/invite:
 *   post:
 *     summary: Generate an invite link for a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Invite link generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteLink:
 *                   type: string
 *                   description: URL for joining the room
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/join/{token}:
 *   post:
 *     summary: Join a room using an invite token
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invite token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password_room:
 *                 type: string
 *                 description: Password for the room (if required)
 *     responses:
 *       200:
 *         description: Joined room successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid password
 *       404:
 *         description: Invalid invite token
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}/members:
 *   get:
 *     summary: Get all members of a room
 *     tags: [Room Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: List of room members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}/members:
 *   post:
 *     summary: Add a member to a room
 *     tags: [Room Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room or user not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/rooms/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a room
 *     tags: [Room Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member removed
 *       404:
 *         description: Room or user not found
 *       401:
 *         description: Unauthorized
 */

router.post("/", authMiddleware, createRoom);
router.get("/", authMiddleware, getRooms);
router.get("/:id", authMiddleware, getRoom);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);
router.post("/:id/invite", authMiddleware, generateInvite);
router.post("/join/:token", authMiddleware, joinRoom);
router.get("/:id/members", authMiddleware, getMembers);
router.post("/:id/members", authMiddleware, addMember);
router.delete("/:id/members/:userId", authMiddleware, removeMember);



module.exports = router;