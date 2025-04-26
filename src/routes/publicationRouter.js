const express = require("express");
const router = express.Router();
const Publication = require("../models/publicationsModel");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: "./src/uploads/",
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, PNG) and MP4 videos are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
  fileFilter: fileFilter,
}).single("file");

/**
 * @swagger
 * components:
 *   schemas:
 *     Publication:
 *       type: object
 *       required:
 *         - author
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the publication
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           description: User who created the publication
 *         content:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL to the uploaded media file
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *                 description: Type of media
 *           description: Media content (image or video)
 *         description:
 *           type: string
 *           description: Optional description of the publication
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *           description: List of likes
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               text:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *           description: List of comments
 *         views:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *           description: List of views
 *         shares:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *           description: List of shares
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date the publication was created
 */

/**
 * @swagger
 * /api/v1/publications/create:
 *   post:
 *     summary: Create a new publication with a single file upload
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image (JPEG, PNG) or video (MP4) file
 *               description:
 *                 type: string
 *                 description: Optional description
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: Publication created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/create", [upload, authMiddleware], async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    const content = {
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("image") ? "image" : "video",
    };

    const publication = new Publication({
      author: req.user.userId,
      content: [content],
      description: req.body.description || "",
    });

    await publication.save();
    const populatedPublication = await Publication.findById(publication._id)
      .populate("author", "name email")
      .populate("likes.userId comments.userId views.userId shares.userId", "name email");

    res.status(201).json({ success: true, data: populatedPublication });
  } catch (error) {
    console.error("Error creating publication:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/edit/{id}:
 *   put:
 *     summary: Edit a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New image or video file (optional)
 *               description:
 *                 type: string
 *                 description: Updated description (optional)
 *     responses:
 *       200:
 *         description: Publication updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to edit
 *       404:
 *         description: Publication not found
 */
router.put("/edit/:id", [upload, authMiddleware], async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updateData = {};
    if (req.file) {
      updateData.content = [{
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype.startsWith("image") ? "image" : "video",
      }];
    }
    if (req.body.description) {
      updateData.description = req.body.description;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    if (!publication.author.equals(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit" });
    }

    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate("author likes.userId comments.userId views.userId shares.userId", "name email");

    res.status(200).json({ success: true, data: updatedPublication });
  } catch (error) {
    console.error("Error updating publication:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/delete/{id}:
 *   delete:
 *     summary: Delete a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: Publication deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete
 *       404:
 *         description: Publication not found
 */
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    if (!publication.author.equals(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete" });
    }

    await Publication.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Publication deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting publication:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications:
 *   get:
 *     summary: Get all publications with pagination and sorting
 *     tags: [Publications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of publications per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-createdAt'
 *         description: Sort order (e.g., '-createdAt' for newest first)
 *     responses:
 *       200:
 *         description: List of publications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     publications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Publication'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "-createdAt";

    const skip = (page - 1) * limit;

    const publications = await Publication.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("author likes.userId comments.userId views.userId shares.userId", "name email");

    const total = await Publication.countDocuments();
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        publications,
        total,
        page,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching publications:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/{id}:
 *   get:
 *     summary: Get a publication by ID
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: Publication found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Publication not found
 */
router.get("/:id", async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id).populate(
      "author likes.userId comments.userId views.userId shares.userId",
      "name email"
    );
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }
    res.status(200).json({ success: true, data: publication });
  } catch (error) {
    console.error("Error fetching publication:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/{id}/comment:
 *   post:
 *     summary: Add a comment to a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Comment text
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 */
router.post("/:id/comment", async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    publication.comments.push({
      userId: req.user.userId,
      text,
    });

    await publication.save();
    const populatedPublication = await Publication.findById(publication._id).populate(
      "author likes.userId comments.userId views.userId shares.userId",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedPublication });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/{id}/like:
 *   post:
 *     summary: Like a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: Like added or already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 */
router.post("/:id/like", async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    const hasLiked = publication.likes.some((like) =>
      like.userId.equals(req.user.userId)
    );
    if (hasLiked) {
      return res.status(200).json({ success: true, data: publication });
    }

    publication.likes.push({
      userId: req.user.userId,
    });

    await publication.save();
    const populatedPublication = await Publication.findById(publication._id).populate(
      "author likes.userId comments.userId views.userId shares.userId",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedPublication });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/{id}/view:
 *   post:
 *     summary: Record a view for a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: View recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 */
router.post("/:id/view", async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    publication.views.push({
      userId: req.user.userId,
    });

    await publication.save();
    const populatedPublication = await Publication.findById(publication._id).populate(
      "author likes.userId comments.userId views.userId shares.userId",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedPublication });
  } catch (error) {
    console.error("Error adding view:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publications/{id}/share:
 *   post:
 *     summary: Share a publication
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publication ID
 *     responses:
 *       200:
 *         description: Share recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 */
router.post("/:id/share", async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" });
    }

    publication.shares.push({
      userId: req.user.userId,
    });

    await publication.save();
    const populatedPublication = await Publication.findById(publication._id).populate(
      "author likes.userId comments.userId views.userId shares.userId",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedPublication });
  } catch (error) {
    console.error("Error adding share:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;