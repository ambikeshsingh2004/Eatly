import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { streakService } from '../services/services';
import { 
  Sparkles, 
  ArrowLeft, 
  Flame,
  Trophy,
  Calendar,
  Plus,
  Check,
  Dumbbell,
  Utensils
} from 'lucide-react';
import './Feature.css';

const Streaks = () => {
  const { profile } = useAuth();
  const [streaks, setStreaks] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalorieForm, setShowCalorieForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [calorieData, setCalorieData] = useState({
    caloriesConsumed: '',
    proteinConsumed: '',
    carbsConsumed: '',
    fatsConsumed: ''
  });

  const [exerciseData, setExerciseData] = useState({
    exerciseType: '',
    durationMinutes: '',
    notes: '',
    metGoal: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [streakRes, historyRes] = await Promise.all([
        streakService.getStreaks(),
        streakService.getHistory(7)
      ]);

      if (streakRes.success) setStreaks(streakRes.data);
      if (historyRes.success) setHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCalories = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await streakService.logCalories({
        caloriesConsumed: parseInt(calorieData.caloriesConsumed),
        proteinConsumed: parseInt(calorieData.proteinConsumed) || 0,
        carbsConsumed: parseInt(calorieData.carbsConsumed) || 0,
        fatsConsumed: parseInt(calorieData.fatsConsumed) || 0
      });

      if (response.success) {
        await fetchData();
        setShowCalorieForm(false);
        setCalorieData({ caloriesConsumed: '', proteinConsumed: '', carbsConsumed: '', fatsConsumed: '' });
      }
    } catch (error) {
      console.error('Failed to log calories:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogExercise = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await streakService.logExercise({
        exerciseType: exerciseData.exerciseType,
        durationMinutes: parseInt(exerciseData.durationMinutes),
        notes: exerciseData.notes,
        metGoal: exerciseData.metGoal
      });

      if (response.success) {
        await fetchData();
        setShowExerciseForm(false);
        setExerciseData({ exerciseType: '', durationMinutes: '', notes: '', metGoal: true });
      }
    } catch (error) {
      console.error('Failed to log exercise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const userProfile = profile?.profile;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

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
            <div className="feature-icon-lg fire">
              <Flame size={32} />
            </div>
            <h1 className="heading-2">Your Streaks</h1>
            <p className="text-secondary">
              Stay consistent and never break the chain!
            </p>
          </section>

          {/* Streak Cards */}
          <section className="streaks-grid">
            {/* Calorie Streak */}
            <div className="streak-stat-card card">
              <div className="streak-stat-header">
                <Utensils size={24} />
                <span>Calorie Streak</span>
              </div>
              <div className="streak-stat-value">
                <span className="streak-number">{streaks?.calorieStreak || 0}</span>
                <span className="streak-unit">days</span>
              </div>
              <div className="streak-stat-best">
                <Trophy size={16} />
                Best: {streaks?.calorieBestStreak || 0} days
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCalorieForm(true)}
              >
                <Plus size={18} /> Log Today
              </button>
            </div>

            {/* Exercise Streak */}
            <div className="streak-stat-card card">
              <div className="streak-stat-header">
                <Dumbbell size={24} />
                <span>Exercise Streak</span>
              </div>
              <div className="streak-stat-value">
                <span className="streak-number exercise">{streaks?.exerciseStreak || 0}</span>
                <span className="streak-unit">days</span>
              </div>
              <div className="streak-stat-best">
                <Trophy size={16} />
                Best: {streaks?.exerciseBestStreak || 0} days
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowExerciseForm(true)}
              >
                <Plus size={18} /> Log Today
              </button>
            </div>
          </section>

          {/* Daily Targets Info */}
          {userProfile && (
            <section className="targets-info card">
              <h4>Your Daily Targets</h4>
              <div className="targets-grid">
                <div className="target-item">
                  <span className="target-value">{userProfile.dailyCalories}</span>
                  <span className="target-label">Calories</span>
                </div>
                <div className="target-item">
                  <span className="target-value">{userProfile.dailyProtein}g</span>
                  <span className="target-label">Protein</span>
                </div>
                <div className="target-item">
                  <span className="target-value">{userProfile.dailyCarbs}g</span>
                  <span className="target-label">Carbs</span>
                </div>
                <div className="target-item">
                  <span className="target-value">{userProfile.dailyFats}g</span>
                  <span className="target-label">Fats</span>
                </div>
              </div>
            </section>
          )}

          {/* History */}
          {history && (history.calorieHistory?.length > 0 || history.exerciseHistory?.length > 0) && (
            <section className="history-section">
              <h3 className="heading-4">
                <Calendar size={20} /> Recent History
              </h3>
              <div className="history-list">
                {history.calorieHistory?.map((log, i) => (
                  <div key={`cal-${i}`} className="history-item">
                    <div className="history-date">{log.date}</div>
                    <div className="history-details">
                      <Utensils size={16} />
                      <span>{log.calories} kcal</span>
                      {log.metGoal && <Check size={16} className="met-goal" />}
                    </div>
                  </div>
                ))}
                {history.exerciseHistory?.map((log, i) => (
                  <div key={`ex-${i}`} className="history-item">
                    <div className="history-date">{log.date}</div>
                    <div className="history-details">
                      <Dumbbell size={16} />
                      <span>{log.exerciseType} - {log.durationMinutes} min</span>
                      {log.metGoal && <Check size={16} className="met-goal" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Calorie Log Modal */}
      {showCalorieForm && (
        <div className="modal-overlay" onClick={() => setShowCalorieForm(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Log Calorie Intake</h3>
            <form onSubmit={handleLogCalories}>
              <div className="input-group">
                <label>Calories Consumed *</label>
                <input
                  type="number"
                  className="input"
                  placeholder={`Target: ${userProfile?.dailyCalories || 2000}`}
                  value={calorieData.caloriesConsumed}
                  onChange={(e) => setCalorieData({...calorieData, caloriesConsumed: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={calorieData.proteinConsumed}
                    onChange={(e) => setCalorieData({...calorieData, proteinConsumed: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={calorieData.carbsConsumed}
                    onChange={(e) => setCalorieData({...calorieData, carbsConsumed: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Fats (g)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={calorieData.fatsConsumed}
                    onChange={(e) => setCalorieData({...calorieData, fatsConsumed: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCalorieForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Log Modal */}
      {showExerciseForm && (
        <div className="modal-overlay" onClick={() => setShowExerciseForm(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Log Exercise</h3>
            <form onSubmit={handleLogExercise}>
              <div className="input-group">
                <label>Exercise Type *</label>
                <select
                  className="input"
                  value={exerciseData.exerciseType}
                  onChange={(e) => setExerciseData({...exerciseData, exerciseType: e.target.value})}
                  required
                >
                  <option value="">Select exercise</option>
                  <option value="Gym Workout">Gym Workout</option>
                  <option value="Running">Running</option>
                  <option value="Walking">Walking</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Home Workout">Home Workout</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  className="input"
                  placeholder="30"
                  value={exerciseData.durationMinutes}
                  onChange={(e) => setExerciseData({...exerciseData, durationMinutes: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Notes (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="How did it go?"
                  value={exerciseData.notes}
                  onChange={(e) => setExerciseData({...exerciseData, notes: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowExerciseForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Streaks;
