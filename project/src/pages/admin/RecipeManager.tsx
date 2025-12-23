import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  recipeApi, 
  Recipe, 
  Ingredient, 
  getCategoryLabel, 
  getDifficultyColor,
  formatCookingTime,
  getTotalCookingTime 
} from '../../services/recipeApi';
import { API_BASE_URL } from '../../services/api';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink', 'appetizer', 'side', 'other'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const METRIC_UNITS = ['g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'piece', 'pinch'];
const IMPERIAL_UNITS = ['oz', 'lb', 'cups', 'fl oz', 'tsp', 'tbsp', 'piece', 'pinch'];

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  rating: number;
  review: string;
  category: Recipe['category'];
  cookingTime: { prep: number; cook: number };
  difficulty: Recipe['difficulty'];
  servings: number;
  tags: string[];
}

const emptyRecipe: RecipeFormData = {
  title: '',
  description: '',
  ingredients: [],
  instructions: [''],
  rating: 5,
  review: '',
  category: 'other',
  cookingTime: { prep: 0, cook: 0 },
  difficulty: 'medium',
  servings: 4,
  tags: [],
};

const emptyIngredient: Ingredient = {
  name: '',
  metric: { amount: 0, unit: 'g' },
  imperial: { amount: 0, unit: 'oz' },
};

export default function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<RecipeFormData>(emptyRecipe);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeApi.getRecipes({ limit: 100 });
      setRecipes(response.recipes);
      setError(null);
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData(emptyRecipe);
    setEditingRecipe(null);
    setIsCreating(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
      rating: recipe.rating,
      review: recipe.review,
      category: recipe.category,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      tags: recipe.tags,
    });
    setEditingRecipe(recipe);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await recipeApi.deleteRecipe(id);
      setRecipes(recipes.filter(r => r._id !== id));
    } catch (err) {
      setError('Failed to delete recipe');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingRecipe) {
        const updated = await recipeApi.updateRecipe(editingRecipe._id, formData);
        setRecipes(recipes.map(r => r._id === updated._id ? updated : r));
      } else {
        const created = await recipeApi.createRecipe(formData);
        setRecipes([created, ...recipes]);
      }
      setIsCreating(false);
      setEditingRecipe(null);
      setFormData(emptyRecipe);
    } catch (err) {
      setError('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !editingRecipe) return;
    
    setUploadingPhotos(true);
    try {
      const files = Array.from(e.target.files);
      const result = await recipeApi.uploadPhotos(editingRecipe._id, files);
      setEditingRecipe(result.recipe);
      setRecipes(recipes.map(r => r._id === result.recipe._id ? result.recipe : r));
    } catch (err) {
      setError('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!editingRecipe) return;
    
    try {
      const updated = await recipeApi.deletePhoto(editingRecipe._id, photoIndex);
      setEditingRecipe(updated);
      setRecipes(recipes.map(r => r._id === updated._id ? updated : r));
    } catch (err) {
      setError('Failed to delete photo');
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ...emptyIngredient }],
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...formData.ingredients];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[index] as any)[parent][child] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setFormData({ ...formData, ingredients: updated });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ''],
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...formData.instructions];
    updated[index] = value;
    setFormData({ ...formData, instructions: updated });
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length <= 1) return;
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  if (loading) {
    return <AdminLayout><div className="p-4">Loading recipes...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipe Manager</h1>
          {!isCreating && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add New Recipe
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isCreating ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
              </h2>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingRecipe(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Recipe['category'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            {/* Cooking Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  value={formData.cookingTime.prep || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ 
                      ...formData, 
                      cookingTime: { ...formData.cookingTime, prep: val === '' ? 0 : parseInt(val) }
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                <input
                  type="number"
                  value={formData.cookingTime.cook || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ 
                      ...formData, 
                      cookingTime: { ...formData.cookingTime, cook: val === '' ? 0 : parseInt(val) }
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Servings</label>
                <input
                  type="number"
                  value={formData.servings || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, servings: val === '' ? 1 : parseInt(val) });
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value as Recipe['difficulty'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  {DIFFICULTIES.map(diff => (
                    <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-10)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-12 text-center">{formData.rating}</span>
                <span className="text-yellow-500">★</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Review</label>
              <textarea
                value={formData.review}
                onChange={e => setFormData({ ...formData, review: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={2}
                placeholder="What did you think of this recipe?"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Ingredients</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Ingredient
                </button>
              </div>
              <div className="space-y-3">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={e => updateIngredient(idx, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1 min-w-[150px] border rounded px-2 py-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Metric:</span>
                      <input
                        type="number"
                        value={ing.metric.amount}
                        onChange={e => updateIngredient(idx, 'metric.amount', parseFloat(e.target.value) || 0)}
                        className="w-16 border rounded px-2 py-1"
                        step="0.1"
                      />
                      <select
                        value={ing.metric.unit}
                        onChange={e => updateIngredient(idx, 'metric.unit', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        {METRIC_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Imperial:</span>
                      <input
                        type="number"
                        value={ing.imperial.amount}
                        onChange={e => updateIngredient(idx, 'imperial.amount', parseFloat(e.target.value) || 0)}
                        className="w-16 border rounded px-2 py-1"
                        step="0.1"
                      />
                      <select
                        value={ing.imperial.unit}
                        onChange={e => updateIngredient(idx, 'imperial.unit', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        {IMPERIAL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Instructions</label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Step
                </button>
              </div>
              <div className="space-y-2">
                {formData.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-1">
                      {idx + 1}
                    </span>
                    <textarea
                      value={step}
                      onChange={e => updateInstruction(idx, e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2"
                      rows={2}
                      placeholder={`Step ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(idx)}
                      className="text-red-500 hover:text-red-700 mt-1"
                      disabled={formData.instructions.length <= 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-500 hover:text-gray-700">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Photos (only when editing) */}
            {editingRecipe && (
              <div>
                <label className="block text-sm font-medium mb-2">Photos</label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {editingRecipe.photos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={photo.startsWith('http') ? photo : `${API_BASE_URL.replace('/api', '')}${photo}`}
                        alt={`Recipe photo ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploadingPhotos}
                />
                {uploadingPhotos && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingRecipe(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingRecipe ? 'Update Recipe' : 'Create Recipe')}
              </button>
            </div>
          </form>
        ) : (
          /* Recipe List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <div key={recipe._id} className="bg-white rounded-lg shadow overflow-hidden">
                {recipe.photos.length > 0 && (
                  <img
                    src={recipe.photos[0].startsWith('http') ? recipe.photos[0] : `${API_BASE_URL.replace('/api', '')}${recipe.photos[0]}`}
                    alt={recipe.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{recipe.title}</h3>
                    <span className="text-yellow-500 font-bold">{recipe.rating}★</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getCategoryLabel(recipe.category)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {formatCookingTime(getTotalCookingTime(recipe))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCreating && recipes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No recipes yet. Create your first recipe!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
