const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Publication = require('../models/publicationsModel');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique IDs
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './src/uploads/',
  filename: (req, file, cb) => {
    const uniqueId = uuidv4(); // Generate unique ID
    const ext = path.extname(file.originalname); // Get file extension (e.g., .jpg, .mp4)
    cb(null, `${uniqueId}${ext}`); // Filename like abc123-def456.jpg
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and MP4 videos are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit per file
  fileFilter: fileFilter,
}).array('files', 5); // Allow up to 5 files

/**
 * @swagger
 * /api/v1/publication/create:
 *   post:
 *     summary: Create a new publication with multiple file uploads
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image (JPEG, PNG) or video (MP4) files to upload (up to 5)
 *               author:
 *                 type: string
 *                 description: The ID of the user creating the publication
 *               description:
 *                 type: string
 *                 description: A description of the publication (optional)
 *             required:
 *               - author
 *               - files
 *     responses:
 *       201:
 *         description: Publication created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request (e.g., invalid file type, missing required fields)
 *       401:
 *         description: Unauthorized
 */
router.post('/create', [authMiddleware, upload], async (req, res) => {
  try {
    if (!req.body.author) {
      return res.status(400).json({ error: 'Author is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const content = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
    }));

    const publication = new Publication({
      author: req.body.author,
      content,
      description: req.body.description || '',
    });

    await publication.save();
    res.status(201).json(publication);
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/edit/{id}:
 *   put:
 *     summary: Edit a publication with optional multiple file uploads
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to edit
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New image (JPEG, PNG) or video (MP4) files to replace existing content (optional, up to 5)
 *               description:
 *                 type: string
 *                 description: Updated description of the publication (optional)
 *     responses:
 *       200:
 *         description: Publication updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request (e.g., invalid file type, no fields to update)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 */
router.put('/edit/:id', [authMiddleware, upload], async (req, res) => {
  try {
    const updateData = {};
    if (req.files && req.files.length > 0) {
      updateData.content = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith('image') ? 'image' : 'video',
      }));
    }
    if (req.body.description) {
      updateData.description = req.body.description;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const publication = await Publication.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json(publication);
  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/delete/{id}:
 *   delete:
 *     summary: Delete a publication
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to delete
 *     responses:
 *       200:
 *         description: Publication deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Publication not found
 *       400:
 *         description: Bad request
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication:
 *   get:
 *     summary: Get all publications with pagination and sorting
 *     tags: [Publications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
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
 *         description: Sort order (e.g., 'createdAt' for ascending, '-createdAt' for descending)
 *     responses:
 *       200:
 *         description: List of publications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Publication'
 *                 total:
 *                   type: integer
 *                   description: Total number of publications
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 pages:
 *                   type: integer
 *                   description: Total number of pages
 *       400:
 *         description: Bad request
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';

    const skip = (page - 1) * limit;

    const publications = await Publication.find()
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Publication.countDocuments();
    const pages = Math.ceil(total / limit);

    res.json({
      publications,
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/{id}:
 *   get:
 *     summary: Get a publication by ID
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to retrieve
 *     responses:
 *       200:
 *         description: Publication found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Publication not found
 *       400:
 *         description: Bad request
 */
router.get('/:id', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json(publication);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/{id}/comment:
 *   post:
 *     summary: Add a comment to a publication
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user adding the comment
 *               text:
 *                 type: string
 *                 description: The comment text
 *             required:
 *               - userId
 *               - text
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Publication not found
 *       400:
 *         description: Bad request
 */
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: 'userId and text are required' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    publication.comments.push({
      userId,
      text,
    });

    await publication.save();
    res.json(publication);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/{id}/like:
 *   post:
 *     summary: Like a publication (one like per user)
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to like
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user liking the publication
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Like added or already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Bad request (e.g., userId missing or invalid publication ID)
 *       404:
 *         description: Publication not found
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid publication ID' });
    }

    const publication = await Publication.findById(id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    const hasLiked = publication.likes.some(like => like.userId.toString() === userId);
    if (hasLiked) {
      return res.status(200).json(publication);
    }

    publication.likes.push({
      userId,
    });

    await publication.save();
    res.json(publication);
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/{id}/save:
 *   post:
 *     summary: Save/View a publication
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to view
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user viewing the publication
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: View recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Publication not found
 *       400:
 *         description: Bad request
 */
router.post('/:id/save', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    publication.views.push({
      userId,
    });

    await publication.save();
    res.json(publication);
  } catch (error) {
    console.error('Error adding view:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/publication/{id}/shares:
 *   post:
 *     summary: Share a publication
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the publication to share
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user sharing the publication
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Share recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Publication not found
 *       400:
 *         description: Bad request
 */
router.post('/:id/shares', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    publication.shares.push({
      userId,
    });

    await publication.save();
    res.json(publication);
  } catch (error) {
    console.error('Error adding share:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;