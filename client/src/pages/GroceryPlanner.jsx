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
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(1);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMealPlan(null);
    setGroceryList(null);

    try {
      const response = await groceryService.getMealPlan(days);
      
      if (response.success) {
        setMealPlan(response.data.mealPlan);
        setGroceryList(response.data.groceryList);
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
          {/* Title Section */}
          <section className="feature-title">
            <div className="feature-icon-lg green">
              <ShoppingCart size={32} />
            </div>
            <h1 className="heading-2">Grocery Planner</h1>
            <p className="text-secondary">
              Get a personalized meal plan with a complete shopping list
            </p>
          </section>

          {/* Controls */}
          {!mealPlan && (
            <section className="control-section card">
              <div className="control-group">
                <label>How many days?</label>
                <div className="day-options">
                  {[3, 5, 7].map((d) => (
                    <button
                      key={d}
                      className={`day-btn ${days === d ? 'selected' : ''}`}
                      onClick={() => setDays(d)}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <><Loader size={20} className="spin" /> Generating with AI...</>
                ) : (
                  <><Calendar size={20} /> Generate Meal Plan</>
                )}
              </button>

              {error && <p className="error-text">{error}</p>}
            </section>
          )}

          {/* Results */}
          {mealPlan && (
            <>
              {/* Meal Plan */}
              <section className="results-section">
                <h2 className="heading-4">Your {days}-Day Meal Plan</h2>
                <div className="meal-plan-list">
                  {mealPlan.map((day) => (
                    <div key={day.day} className="day-card card">
                      <button 
                        className="day-header"
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      >
                        <span className="day-title">Day {day.day}</span>
                        <span className="day-calories">
                          {day.totalNutrition?.calories || '~1800'} kcal
                        </span>
                        {expandedDay === day.day ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {expandedDay === day.day && (
                        <div className="day-meals">
                          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                            <div key={mealType} className="meal-item">
                              <span className="meal-type">{mealType}</span>
                              <span className="meal-name">{day.meals[mealType]?.name}</span>
                              <span className="meal-cal">{day.meals[mealType]?.calories} kcal</span>
                            </div>
                          ))}
                          {day.meals.snacks?.map((snack, i) => (
                            <div key={i} className="meal-item snack">
                              <span className="meal-type">Snack</span>
                              <span className="meal-name">{snack.name}</span>
                              <span className="meal-cal">{snack.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Grocery List */}
              {groceryList && (
                <section className="results-section">
                  <h2 className="heading-4">Shopping List</h2>
                  <div className="grocery-grid">
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
                </section>
              )}

              {/* Reset Button */}
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setMealPlan(null);
                  setGroceryList(null);
                }}
              >
                Generate New Plan
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroceryPlanner;
