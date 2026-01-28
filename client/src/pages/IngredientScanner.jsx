import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ingredientService } from '../services/services';
import { 
  Sparkles, 
  ArrowLeft, 
  Camera, 
  Upload,
  Image as ImageIcon,
  ChefHat,
  Clock,
  Flame,
  Loader
} from 'lucide-react';
import './Feature.css';

const IngredientScanner = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState(null);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Analyze
    await analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    setAnalyzing(true);
    setError('');
    setIngredients(null);
    setRecipes(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const mimeType = file.type;

        const response = await ingredientService.analyzeImage(base64, mimeType);
        
        if (response.success) {
          setIngredients(response.data.ingredients);
        } else {
          setError(response.message || 'Failed to analyze image');
        }
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setAnalyzing(false);
    }
  };

  const handleGetRecipes = async () => {
    if (!ingredients || ingredients.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const ingredientNames = ingredients.map(i => i.name);
      const response = await ingredientService.suggestRecipes(ingredientNames);
      
      if (response.success) {
        setRecipes(response.data.recipes);
      } else {
        setError(response.message || 'Failed to get recipes');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImagePreview(null);
    setIngredients(null);
    setRecipes(null);
    setError('');
  };

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
            <div className="feature-icon-lg purple">
              <Camera size={32} />
            </div>
            <h1 className="heading-2">Ingredient Scanner</h1>
            <p className="text-secondary">
              Upload a photo of your ingredients and get recipe suggestions
            </p>
          </section>

          {/* Upload Section */}
          {!imagePreview && (
            <section className="upload-section card">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div 
                className="upload-area"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <h3>Upload Image</h3>
                <p className="text-muted">Click or drag & drop your image here</p>
                <p className="text-muted">Supports JPG, PNG, WebP</p>
              </div>
            </section>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <section className="preview-section">
              <div className="image-preview card">
                <img src={imagePreview} alt="Uploaded ingredients" />
                {analyzing && (
                  <div className="analyzing-overlay">
                    <Loader size={32} className="spin" />
                    <span>Analyzing with AI...</span>
                  </div>
                )}
              </div>
              <button className="btn btn-ghost" onClick={resetAll}>
                Upload Different Image
              </button>
            </section>
          )}

          {error && <p className="error-text center">{error}</p>}

          {/* Detected Ingredients */}
          {ingredients && ingredients.length > 0 && (
            <section className="results-section">
              <h2 className="heading-4">Detected Ingredients ({ingredients.length})</h2>
              <div className="ingredients-grid">
                {ingredients.map((ingredient, i) => (
                  <div key={i} className="ingredient-tag">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-qty">{ingredient.quantity}</span>
                  </div>
                ))}
              </div>
              
              {!recipes && (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleGetRecipes}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader size={20} className="spin" /> Getting Recipes...</>
                  ) : (
                    <><ChefHat size={20} /> Get Recipe Suggestions</>
                  )}
                </button>
              )}
            </section>
          )}

          {/* Recipe Suggestions */}
          {recipes && recipes.length > 0 && (
            <section className="results-section">
              <h2 className="heading-4">Recipe Suggestions</h2>
              <div className="recipes-list">
                {recipes.map((recipe, i) => (
                  <div key={i} className="recipe-card card">
                    <div className="recipe-header">
                      <h3>{recipe.name}</h3>
                      <span className="recipe-difficulty">{recipe.difficulty}</span>
                    </div>
                    <p className="recipe-description">{recipe.description}</p>
                    <div className="recipe-meta">
                      <span><Clock size={16} /> {recipe.prepTime + recipe.cookTime} min</span>
                      <span><Flame size={16} /> {recipe.nutrition?.calories} kcal</span>
                    </div>
                    <div className="recipe-macros">
                      <span>P: {recipe.nutrition?.protein}g</span>
                      <span>C: {recipe.nutrition?.carbs}g</span>
                      <span>F: {recipe.nutrition?.fats}g</span>
                    </div>
                    {recipe.steps && (
                      <details className="recipe-steps">
                        <summary>View Steps</summary>
                        <ol>
                          {recipe.steps.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default IngredientScanner;
