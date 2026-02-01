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
  Loader,
  X,
  Plus
} from 'lucide-react';
import './Feature.css';

const IngredientScanner = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState(null);
  const [editedIngredients, setEditedIngredients] = useState(null);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');
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
    setEditedIngredients(null);
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
          // Create a copy for editing
          setEditedIngredients([...response.data.ingredients]);
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
    if (!editedIngredients || editedIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ingredientNames = editedIngredients.map(i => i.name);
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

  const removeIngredient = (index) => {
    const updated = editedIngredients.filter((_, i) => i !== index);
    setEditedIngredients(updated);
  };

  const addIngredient = () => {
    if (!newIngredientName.trim()) {
      setError('Please enter an ingredient name');
      return;
    }

    const newIngredient = {
      name: newIngredientName.trim(),
      quantity: newIngredientQty.trim() || 'As needed'
    };

    setEditedIngredients([...editedIngredients, newIngredient]);
    setNewIngredientName('');
    setNewIngredientQty('');
    setError('');
  };

  const resetAll = () => {
    setImagePreview(null);
    setIngredients(null);
    setEditedIngredients(null);
    setRecipes(null);
    setError('');
    setNewIngredientName('');
    setNewIngredientQty('');
  };

  return (
    <div className="feature-page">


      <main className="feature-main">
        <div className="container">
          {/* Title */}
          <section className="feature-title animate-fadeIn">
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
            <section className="upload-section card card-premium animate-slideUp animate-delay-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div 
                className="upload-area hover-lift"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="upload-icon animate-float">
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
            <section className="preview-section animate-scaleIn">
              <div className="image-preview card">
                <img src={imagePreview} alt="Uploaded ingredients" />
                {analyzing && (
                  <div className="analyzing-overlay backdrop-blur">
                    <Loader size={32} className="animate-rotate" />
                    <span>Analyzing with AI...</span>
                  </div>
                )}
              </div>
              <button className="btn btn-ghost hover-scale" onClick={resetAll}>
                Upload Different Image
              </button>
            </section>
          )}

          {error && <p className="error-text center animate-wiggle">{error}</p>}

          {/* Detected Ingredients */}
          {editedIngredients && editedIngredients.length >= 0 && (
            <section className="results-section animate-slideUp">
              <div className="section-header">
                <h2 className="heading-4">Your Ingredients ({editedIngredients.length})</h2>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Remove incorrect items or add missing ingredients below
                </p>
              </div>
              
              <div className="ingredients-grid">
                {editedIngredients.map((ingredient, i) => (
                  <div 
                    key={i} 
                    className={`ingredient-tag editable hover-lift animate-scaleIn animate-delay-${Math.min(i + 1, 5)}`}
                  >
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-qty">{ingredient.quantity}</span>
                    <button 
                      className="remove-ingredient-btn"
                      onClick={() => removeIngredient(i)}
                      title="Remove ingredient"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Ingredient Form */}
              <div className="add-ingredient-section card-glass animate-slideUp animate-delay-2">
                <h3 className="heading-5" style={{ marginBottom: '1rem' }}>Add Ingredient</h3>
                <div className="add-ingredient-form">
                  <input
                    type="text"
                    className="input"
                    placeholder="Ingredient name (e.g., Tomato)"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Quantity (optional)"
                    value={newIngredientQty}
                    onChange={(e) => setNewIngredientQty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <button 
                    className="btn btn-secondary hover-scale"
                    onClick={addIngredient}
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              </div>
              
              {!recipes && (
                <button 
                  className="btn btn-primary btn-lg hover-lift animate-glowPulse"
                  onClick={handleGetRecipes}
                  disabled={loading || editedIngredients.length === 0}
                >
                  {loading ? (
                    <><Loader size={20} className="animate-rotate" /> Getting Recipes...</>
                  ) : (
                    <><ChefHat size={20} /> Get Recipe Suggestions</>
                  )}
                </button>
              )}
            </section>
          )}

          {/* Recipe Suggestions */}
          {recipes && recipes.length > 0 && (
            <section className="results-section animate-fadeIn">
              <h2 className="heading-4">Recipe Suggestions</h2>
              <div className="recipes-list">
                {recipes.map((recipe, i) => (
                  <div 
                    key={i} 
                    className={`recipe-card card card-premium hover-lift animate-slideUp animate-delay-${Math.min(i + 1, 5)}`}
                  >
                    <div className="recipe-header">
                      <h3>{recipe.name}</h3>
                      <span className="recipe-difficulty badge badge-primary">{recipe.difficulty}</span>
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
              <button className="btn btn-ghost hover-scale" onClick={resetAll}>
                Start Over
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default IngredientScanner;
