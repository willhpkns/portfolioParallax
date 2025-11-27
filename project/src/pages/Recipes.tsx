import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  recipeApi, 
  Recipe, 
  RecipeFilters,
  getCategoryLabel, 
  getDifficultyColor,
  formatCookingTime,
  getTotalCookingTime 
} from '../services/recipeApi';
import { API_BASE_URL } from '../services/api';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'snack', label: 'Snack' },
  { value: 'drink', label: 'Drink' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'side', label: 'Side Dish' },
  { value: 'other', label: 'Other' },
];

const DIFFICULTIES = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Alphabetical' },
];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [category, difficulty, minRating, sortBy, search, pagination.page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const filters: RecipeFilters = {
        page: pagination.page,
        limit: 12,
        sortBy,
        order: sortBy === 'rating' ? 'desc' : sortBy === 'createdAt' ? 'desc' : 'asc',
      };
      
      if (search) filters.search = search;
      if (category !== 'all') filters.category = category;
      if (difficulty !== 'all') filters.difficulty = difficulty;
      if (minRating > 0) filters.minRating = minRating;
      
      const response = await recipeApi.getRecipes(filters);
      setRecipes(response.recipes);
      setPagination(prev => ({
        ...prev,
        pages: response.pagination.pages,
        total: response.pagination.total,
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('all');
    setDifficulty('all');
    setMinRating(0);
    setSortBy('createdAt');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith('http')) return photo;
    return `${API_BASE_URL.replace('/api', '')}${photo}`;
  };

  return (
    <div className="min-h-screen bg-[#F5EDE0]">
      {/* Header */}
      <div className="py-12 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-[#2C1810]">Recipe Journal</h1>
          <p className="text-[#5C4B37]">My collection of tried and tested recipes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search recipes..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5C4B37]"
            />
            <button
              type="submit"
              className="bg-[#5C4B37] text-white px-6 py-2 rounded-lg hover:bg-[#2C1810] transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="border rounded-lg px-3 py-2"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={e => { setDifficulty(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="border rounded-lg px-3 py-2"
            >
              {DIFFICULTIES.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Min Rating:</label>
              <select
                value={minRating}
                onChange={e => { setMinRating(parseInt(e.target.value)); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>Any</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}+ ★</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-[#5C4B37] mb-4">
          {pagination.total} recipe{pagination.total !== 1 ? 's' : ''} found
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C4B37] mx-auto"></div>
            <p className="mt-4 text-[#5C4B37]">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 text-[#5C4B37]">
            <p className="text-xl mb-2">No recipes found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative h-48 bg-gray-200">
                    {recipe.photos.length > 0 ? (
                      <img
                        src={getPhotoUrl(recipe.photos[0])}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold text-[#5C4B37]">
                      {recipe.rating}/10 ★
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#5C4B37] transition">
                      {recipe.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-[#E6D5AC] text-[#2C1810] px-2 py-1 rounded-full">
                        {getCategoryLabel(recipe.category)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-[#5C4B37]">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatCookingTime(getTotalCookingTime(recipe))}
                      <span className="mx-2">•</span>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {recipe.servings} servings
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
