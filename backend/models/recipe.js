const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  metric: {
    amount: { type: Number, required: true },
    unit: { type: String, required: true } // g, kg, ml, L, etc.
  },
  imperial: {
    amount: { type: Number, required: true },
    unit: { type: String, required: true } // oz, lb, cups, tbsp, tsp, etc.
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  photos: {
    type: [String],
    default: []
  },
  ingredients: {
    type: [ingredientSchema],
    default: []
  },
  instructions: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  review: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink', 'appetizer', 'side', 'other'],
    default: 'other'
  },
  cookingTime: {
    prep: { type: Number, default: 0 }, // in minutes
    cook: { type: Number, default: 0 }  // in minutes
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  servings: {
    type: Number,
    default: 4
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  strict: true
});

// Index for search functionality
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
