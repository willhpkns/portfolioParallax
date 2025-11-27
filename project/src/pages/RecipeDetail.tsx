import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  recipeApi, 
  Recipe,
  getCategoryLabel, 
  getDifficultyColor,
  formatCookingTime,
} from '../services/recipeApi';
import { API_BASE_URL } from '../services/api';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMetric, setUseMetric] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (id) fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const data = await recipeApi.getRecipe(id!);
      setRecipe(data);
      setError(null);
    } catch (err) {
      setError('Failed to load recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith('http')) return photo;
    return `${API_BASE_URL.replace('/api', '')}${photo}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EDE0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C4B37] mx-auto"></div>
          <p className="mt-4 text-[#5C4B37]">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[#F5EDE0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Recipe not found'}</p>
          <Link to="/recipes" className="text-[#5C4B37] hover:underline">
            ← Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EDE0]">
      {/* Hero Section with Photo */}
      <div className="relative h-[40vh] md:h-[50vh] bg-[#2C1810]">
        {recipe.photos.length > 0 ? (
          <>
            <img
              src={getPhotoUrl(recipe.photos[currentPhotoIndex])}
              alt={recipe.title}
              className="w-full h-full object-cover opacity-80"
            />
            {recipe.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {recipe.photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back button */}
        <Link
          to="/recipes"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-800 hover:bg-white transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="bg-[#5C4B37] px-3 py-1 rounded-full text-sm font-medium">
                {getCategoryLabel(recipe.category)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {recipe.rating}/10 ★
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {recipe.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#2C1810]">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#E6D5AC] text-[#2C1810] rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Review */}
            {recipe.review && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-[#2C1810]">My Review</h2>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#E6D5AC] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#5C4B37]">{recipe.rating}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{recipe.review}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-[#2C1810]">Quick Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-sm text-[#5C4B37]">Prep Time</p>
                  <p className="font-bold text-lg text-[#2C1810]">{formatCookingTime(recipe.cookingTime.prep)}</p>
                </div>
                <div className="text-center p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-sm text-[#5C4B37]">Cook Time</p>
                  <p className="font-bold text-lg text-[#2C1810]">{formatCookingTime(recipe.cookingTime.cook)}</p>
                </div>
                <div className="text-center p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-sm text-[#5C4B37]">Total Time</p>
                  <p className="font-bold text-lg text-[#2C1810]">{formatCookingTime(recipe.cookingTime.prep + recipe.cookingTime.cook)}</p>
                </div>
                <div className="text-center p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-sm text-[#5C4B37]">Servings</p>
                  <p className="font-bold text-lg text-[#2C1810]">{recipe.servings}</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[#2C1810]">Ingredients</h3>
                <div className="flex bg-[#F5EDE0] rounded-lg p-1">
                  <button
                    onClick={() => setUseMetric(true)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                      useMetric ? 'bg-white shadow text-[#5C4B37]' : 'text-[#5C4B37] hover:text-[#2C1810]'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    onClick={() => setUseMetric(false)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                      !useMetric ? 'bg-white shadow text-[#5C4B37]' : 'text-[#5C4B37] hover:text-[#2C1810]'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
              </div>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => {
                  const measurement = useMetric ? ing.metric : ing.imperial;
                  return (
                    <li key={idx} className="flex justify-between items-center py-2 border-b border-[#E6D5AC] last:border-0">
                      <span className="text-gray-700">{ing.name}</span>
                      <span className="font-medium text-[#5C4B37]">
                        {measurement.amount} {measurement.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-3 text-[#2C1810]">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="bg-[#E6D5AC] text-[#2C1810] px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery Thumbnails */}
            {recipe.photos.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-3 text-[#2C1810]">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {recipe.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        idx === currentPhotoIndex ? 'border-[#5C4B37]' : 'border-transparent hover:border-[#E6D5AC]'
                      }`}
                    >
                      <img
                        src={getPhotoUrl(photo)}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
