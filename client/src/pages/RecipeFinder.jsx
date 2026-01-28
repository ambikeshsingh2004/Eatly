import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/services';
import { 
  Sparkles, 
  ArrowLeft, 
  ChefHat, 
  Search,
  Clock,
  Flame,
  Users,
  Loader
} from 'lucide-react';
import './Feature.css';

const RecipeFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      const response = await recipeService.getRecipe(searchQuery);
      
      if (response.success && response.data.recipe) {
        setRecipe(response.data.recipe);
      } else {
        setError(response.message || 'Recipe not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const popularDishes = [
    'Butter Chicken', 'Pasta Carbonara', 'Greek Salad', 
    'Grilled Salmon', 'Vegetable Stir Fry', 'Chicken Biryani'
  ];

  return (
    <div className="feature-page">
      {/* Header */}
      <header className="feature-header">
        <div className="container">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="logo">
            <Sparkles size={24} />
            <span>Eatly</span>
          </div>
        </div>
      </header>

      <main className="feature-main">
        <div className="container">
          {/* Title */}
          <section className="feature-title">
            <div className="feature-icon-lg orange">
              <ChefHat size={32} />
            </div>
            <h1 className="heading-2">Recipe Finder</h1>
            <p className="text-secondary">
              Search any dish and get a detailed recipe with nutrition info
            </p>
          </section>

          {/* Search Section */}
          <section className="search-section card">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="input search-input"
                  placeholder="Enter dish name (e.g., Butter Chicken)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? <Loader size={20} className="spin" /> : 'Search'}
              </button>
            </form>

            {!recipe && (
              <div className="popular-dishes">
                <span className="popular-label">Popular:</span>
                {popularDishes.map((dish) => (
                  <button
                    key={dish}
                    className="popular-btn"
                    onClick={() => setSearchQuery(dish)}
                  >
                    {dish}
                  </button>
                ))}
              </div>
            )}
          </section>

          {error && <p className="error-text center">{error}</p>}

          {/* Recipe Result */}
          {recipe && (
            <section className="recipe-detail card">
              <div className="recipe-detail-header">
                <h2 className="heading-3">{recipe.name}</h2>
                <p className="text-secondary">{recipe.description}</p>
                
                <div className="recipe-detail-meta">
                  <span><Clock size={18} /> {recipe.prepTime + recipe.cookTime} min</span>
                  <span><Users size={18} /> {recipe.servings} servings</span>
                  <span className="difficulty-badge">{recipe.difficulty}</span>
                </div>
              </div>

              {/* Nutrition */}
              <div className="nutrition-card">
                <h4>Nutrition Per Serving</h4>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <Flame size={20} />
                    <span className="nutrition-value">{recipe.nutrition?.perServing?.calories}</span>
                    <span className="nutrition-label">Calories</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition?.perServing?.protein}g</span>
                    <span className="nutrition-label">Protein</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition?.perServing?.carbs}g</span>
                    <span className="nutrition-label">Carbs</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition?.perServing?.fats}g</span>
                    <span className="nutrition-label">Fats</span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="recipe-section">
                <h4>Ingredients</h4>
                <ul className="ingredients-list">
                  {recipe.ingredients?.map((ing, i) => (
                    <li key={i}>
                      <span className="ing-qty">{ing.quantity}</span>
                      <span className="ing-item">{ing.item}</span>
                      {ing.notes && <span className="ing-notes">({ing.notes})</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="recipe-section">
                <h4>Instructions</h4>
                <ol className="instructions-list">
                  {recipe.instructions?.map((step, i) => (
                    <li key={i}>
                      <span className="step-number">{step.step}</span>
                      <span className="step-text">{step.instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="recipe-section">
                  <h4>Pro Tips</h4>
                  <ul className="tips-list">
                    {recipe.tips.map((tip, i) => (
                      <li key={i}>💡 {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Healthier Alternatives */}
              {recipe.healthierAlternatives && recipe.healthierAlternatives.length > 0 && (
                <div className="recipe-section">
                  <h4>Healthier Alternatives</h4>
                  <ul className="alternatives-list">
                    {recipe.healthierAlternatives.map((alt, i) => (
                      <li key={i}>🥗 {alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* New Search */}
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setRecipe(null);
                  setSearchQuery('');
                }}
              >
                Search Another Recipe
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecipeFinder;
