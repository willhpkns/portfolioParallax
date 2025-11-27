const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Recipe = require('../models/recipe');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/recipes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all recipes (public) - with search and filters
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      difficulty, 
      minRating, 
      maxCookingTime,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    // Minimum rating filter
    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }

    // Max cooking time filter (prep + cook)
    if (maxCookingTime) {
      query.$expr = {
        $lte: [
          { $add: ['$cookingTime.prep', '$cookingTime.cook'] },
          parseInt(maxCookingTime)
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Recipe.countDocuments(query)
    ]);

    res.json({
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ message: 'Error fetching recipes', error: err.message });
  }
});

// GET single recipe (public)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err);
    res.status(500).json({ message: 'Error fetching recipe', error: err.message });
  }
});

// POST create recipe (admin only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating recipe with data:', req.body);
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    console.error('Error creating recipe:', err);
    res.status(500).json({ message: 'Error creating recipe', error: err.message });
  }
});

// PUT update recipe (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating recipe with data:', req.body);
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).json({ message: 'Error updating recipe', error: err.message });
  }
});

// DELETE recipe (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Delete associated photos
    for (const photo of recipe.photos) {
      const photoPath = path.join(__dirname, '../uploads/recipes', path.basename(photo));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    res.status(500).json({ message: 'Error deleting recipe', error: err.message });
  }
});

// POST upload photos (admin only)
router.post('/:id/photos', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      // Clean up uploaded files
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const photoUrls = req.files.map(file => `/uploads/recipes/${file.filename}`);
    recipe.photos.push(...photoUrls);
    await recipe.save();

    res.json({ photos: photoUrls, recipe });
  } catch (err) {
    console.error('Error uploading photos:', err);
    // Clean up uploaded files on error
    req.files?.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    res.status(500).json({ message: 'Error uploading photos', error: err.message });
  }
});

// DELETE single photo (admin only)
router.delete('/:id/photos/:photoIndex', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const photoIndex = parseInt(req.params.photoIndex);
    if (photoIndex < 0 || photoIndex >= recipe.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    const photoUrl = recipe.photos[photoIndex];
    const photoPath = path.join(__dirname, '../uploads/recipes', path.basename(photoUrl));
    
    // Delete file
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Remove from array
    recipe.photos.splice(photoIndex, 1);
    await recipe.save();

    res.json({ message: 'Photo deleted successfully', recipe });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ message: 'Error deleting photo', error: err.message });
  }
});

// GET categories list (for filters)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Recipe.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router;
