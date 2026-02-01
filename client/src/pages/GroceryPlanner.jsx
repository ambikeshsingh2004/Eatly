import { useState } from 'react';
import { Link } from 'react-router-dom';
import { groceryService } from '../services/services';
import { 
  Sparkles, 
  ArrowLeft, 
  ShoppingCart, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader
} from 'lucide-react';
import './Feature.css';

const GroceryPlanner = () => {
  // --- State Stuff ---
  // How many days do we want to plan for? (3, 5, or 7)
  const [days, setDays] = useState(3);
  const [ingredientLimit, setIngredientLimit] = useState(20);
  const [shoppingMode, setShoppingMode] = useState('economical'); // 'economical' saves money, 'premium' gets fancy
  
  // Loading and Error states for the UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results from the AI
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  
  // Which tab is open? The Plan or the List?
  const [activeTab, setActiveTab] = useState('plan');

  // --- The Heavy Lifting ---
  // Calls our backend which asks Gemini AI to build the plan
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMealPlan(null);
    setGroceryList(null);

    try {
      const response = await groceryService.getMealPlan(days, ingredientLimit, shoppingMode);
      
      if (response.success) {
        setMealPlan(response.data.mealPlan);
        setGroceryList(response.data.groceryList);
        setActiveTab('plan');
      } else {
        setError(response.message || 'Failed to generate meal plan');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <main className="feature-main">
        <div className="container">
          {/* 
            Title Section 
            This is just the header text and icon 
          */}
          <section className="feature-title">
            <div className="feature-icon-lg green">
              <ShoppingCart size={32} />
            </div>
            <h1 className="heading-2">Grocery Planner</h1>
            <p className="text-secondary">
              Get a personalized meal plan with a complete shopping list
            </p>
          </section>

          {/* 
            Controls Section
            Only show this if we don't have a plan yet 
          */}
          {!mealPlan && (
            <section className="control-section card">
              <div className="controls-grid">
                <div className="control-group">
                  <label>Duration</label>
                  <div className="day-options">
                    {[3, 5, 7].map((d) => (
                      <button
                        key={d}
                        className={`day-btn ${days === d ? 'selected' : ''}`}
                        onClick={() => setDays(d)}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>Shopping Mode</label>
                  <div className="mode-options">
                    <button
                      className={`mode-btn ${shoppingMode === 'economical' ? 'selected' : ''}`}
                      onClick={() => setShoppingMode('economical')}
                    >
                      💰 Economical
                      <span className="mode-desc">Budget-friendly</span>
                    </button>
                    <button
                      className={`mode-btn ${shoppingMode === 'premium' ? 'selected' : ''}`}
                      onClick={() => setShoppingMode('premium')}
                    >
                      💎 Premium
                      <span className="mode-desc">Top quality</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="control-group mt-6">
                <div className="flex justify-between items-center mb-2">
                  <label>Max Ingredients (Top Priority)</label>
                  <span className="badge badge-primary">{ingredientLimit} items</span>
                </div>
                <div className="range-container">
                  <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    step="5" 
                    value={ingredientLimit} 
                    onChange={(e) => setIngredientLimit(parseInt(e.target.value))}
                    className="range-input"
                  />
                </div>

              </div>
              
              <button 
                className="btn btn-primary btn-lg w-full mt-6"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <><Loader size={20} className="spin" /> Generating Plan...</>
                ) : (
                  <><Calendar size={20} /> Generate Meal Plan</>
                )}
              </button>

              {error && <p className="error-text text-center">{error}</p>}
            </section>
          )}

          {/* Results */}
          {mealPlan && (
            <div className="results-container animate-fadeIn">
              {/* Tabs */}
              <div className="tabs">
                <button 
                  className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
                  onClick={() => setActiveTab('plan')}
                >
                  <Calendar size={18} /> Meal Plan
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                  onClick={() => setActiveTab('list')}
                >
                  <ShoppingCart size={18} /> Shopping List
                </button>
              </div>

              {/* Meal Plan Content */}
              {activeTab === 'plan' && (
                <div className="meal-plan-list animate-slideUp">
                  {mealPlan.map((day) => (
                    <div key={day.day} className="day-card card">
                      <button 
                        className="day-header"
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      >
                        <div className="day-header-left">
                          <span className="day-badge">Day {day.day}</span>
                          <span className="day-calories-badge">
                            {day.totalNutrition?.calories || '~1800'} kcal
                          </span>
                        </div>
                        {expandedDay === day.day ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {expandedDay === day.day && (
                        <div className="day-meals">
                          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                            <div key={mealType} className="meal-item">
                              <span className="meal-type">{mealType}</span>
                              <div className="meal-content">
                                <span className="meal-name">{day.meals[mealType]?.name}</span>
                                <span className="meal-cal">{day.meals[mealType]?.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Grocery List Content */}
              {activeTab === 'list' && groceryList && (
                <div className="grocery-grid animate-slideUp">
                  {Object.entries(groceryList).map(([category, items]) => (
                    <div key={category} className="grocery-card card">
                      <h3 className="grocery-category">{category}</h3>
                      <ul className="grocery-items">
                        {Array.isArray(items) && items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Reset Button */}
              <div className="action-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setMealPlan(null);
                    setGroceryList(null);
                  }}
                >
                  Generate New Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroceryPlanner;
