import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/services';
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Target, 
  Dumbbell,
  Check,
  Sparkles
} from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // This is where we store all the user's details before sending to the backend.
  // We need this data to make the AI smart (e.g. giving fewer calories if weight loss is the goal).
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    dietType: '',
    goal: '',
    language: 'English',
    activityLevel: '',
    exercisePreferences: {
      canGoGym: false,
      homeWorkout: false,
      canCycle: false,
      canSwim: false,
      canWalk: false,
      canRun: false,
      canYoga: false,
      maxTimeMinutes: 30
    }
  });

  const totalSteps = 4;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('exercise.')) {
      const exerciseField = name.split('.')[1];
      setFormData({
        ...formData,
        exercisePreferences: {
          ...formData.exercisePreferences,
          [exerciseField]: type === 'checkbox' ? checked : parseInt(value)
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await profileService.completeOnboarding(formData);
      
      if (response.success) {
        await refreshProfile();
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`step-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
            >
              {s < step ? <Check size={14} /> : s}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="onboarding-card">
          {/* 
            Step 1: The Basics 
            Age, Weight, Height are crucial for calculating BMR (Basal Metabolic Rate).
          */}
          {step === 1 && (
            <div className="step-content animate-slideUp">
              <div className="step-icon">
                <User size={32} />
              </div>
              <h2 className="heading-3">Let's get to know you</h2>
              <p className="text-secondary">Tell us about yourself</p>

              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    className="input"
                    placeholder="25"
                    min="13"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    className="input"
                    placeholder="70"
                    min="20"
                    max="500"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    className="input"
                    placeholder="175"
                    min="50"
                    max="300"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Gender</label>
                <div className="option-grid">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`option-btn ${formData.gender === g ? 'selected' : ''}`}
                      onClick={() => selectOption('gender', g)}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Preferred Language</label>
                <div className="option-grid">
                  {['English', 'Hindi', 'Chinese', 'Japanese'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`option-btn ${formData.language === lang ? 'selected' : ''}`}
                      onClick={() => selectOption('language', lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 
            Step 2: Goals & Diet 
            This tells the AI what kind of food to suggest (e.g. High Protein for Muscle Gain).
          */}
          {step === 2 && (
            <div className="step-content animate-slideUp">
              <div className="step-icon">
                <Target size={32} />
              </div>
              <h2 className="heading-3">Your diet & goals</h2>
              <p className="text-secondary">What are you working towards?</p>

              <div className="input-group">
                <label>Diet Preference</label>
                <div className="option-grid cols-2">
                  {[
                    { value: 'vegetarian', label: '🥗 Vegetarian' },
                    { value: 'non-vegetarian', label: '🍖 Non-Vegetarian' },
                    { value: 'vegan', label: '🌱 Vegan' },
                    { value: 'eggetarian', label: '🥚 Eggetarian' }
                  ].map((diet) => (
                    <button
                      key={diet.value}
                      type="button"
                      className={`option-btn ${formData.dietType === diet.value ? 'selected' : ''}`}
                      onClick={() => selectOption('dietType', diet.value)}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Your Goal</label>
                <div className="option-grid cols-2">
                  {[
                    { value: 'weight_loss', label: '📉 Weight Loss' },
                    { value: 'muscle_gain', label: '💪 Muscle Gain' },
                    { value: 'weight_gain', label: '📈 Weight Gain' },
                    { value: 'maintain', label: '⚖️ Maintain' },
                    { value: 'athletic', label: '🏃 Athletic Performance' }
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      className={`option-btn ${formData.goal === goal.value ? 'selected' : ''}`}
                      onClick={() => selectOption('goal', goal.value)}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Activity Level</label>
                <div className="option-list">
                  {[
                    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                    { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
                    { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
                    { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
                    { value: 'very_active', label: 'Very Active', desc: 'Hard exercise + physical job' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`option-item ${formData.activityLevel === level.value ? 'selected' : ''}`}
                      onClick={() => selectOption('activityLevel', level.value)}
                    >
                      <span className="option-label">{level.label}</span>
                      <span className="option-desc">{level.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 
            Step 3: Sweat Equity 
            We ask what equipment they have so we don't suggest Swimming if they have no pool!
          */}
          {step === 3 && (
            <div className="step-content animate-slideUp">
              <div className="step-icon">
                <Dumbbell size={32} />
              </div>
              <h2 className="heading-3">Exercise preferences</h2>
              <p className="text-secondary">What activities can you do?</p>

              <div className="input-group">
                <label>Available Activities</label>
                <div className="checkbox-grid">
                  {[
                    { key: 'canGoGym', label: '🏋️ Gym' },
                    { key: 'homeWorkout', label: '🏠 Home Workout' },
                    { key: 'canCycle', label: '🚴 Cycling' },
                    { key: 'canSwim', label: '🏊 Swimming' },
                    { key: 'canWalk', label: '🚶 Walking' },
                    { key: 'canRun', label: '🏃 Running' },
                    { key: 'canYoga', label: '🧘 Yoga' }
                  ].map((activity) => (
                    <label key={activity.key} className="checkbox-item">
                      <input
                        type="checkbox"
                        name={`exercise.${activity.key}`}
                        checked={formData.exercisePreferences[activity.key]}
                        onChange={handleChange}
                      />
                      <span className="checkbox-box"></span>
                      <span>{activity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Daily exercise time available</label>
                <div className="time-options">
                  {[15, 30, 45, 60, 90].map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`time-btn ${formData.exercisePreferences.maxTimeMinutes === time ? 'selected' : ''}`}
                      onClick={() => setFormData({
                        ...formData,
                        exercisePreferences: {
                          ...formData.exercisePreferences,
                          maxTimeMinutes: time
                        }
                      })}
                    >
                      {time} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 
            Step 4: The Final check 
            Show them what they picked before we save it to the database.
          */}
          {step === 4 && (
            <div className="step-content animate-slideUp">
              <div className="step-icon success">
                <Sparkles size={32} />
              </div>
              <h2 className="heading-3">You're all set!</h2>
              <p className="text-secondary">Let's review your profile</p>

              {error && (
                <div className="onboarding-error">{error}</div>
              )}

              <div className="review-section">
                <div className="review-item">
                  <span className="review-label">Name</span>
                  <span className="review-value">{formData.fullName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Age</span>
                  <span className="review-value">{formData.age} years</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Weight</span>
                  <span className="review-value">{formData.weight} kg</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Height</span>
                  <span className="review-value">{formData.height} cm</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Diet</span>
                  <span className="review-value">{formData.dietType}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Goal</span>
                  <span className="review-value">{formData.goal?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="onboarding-nav">
            {step > 1 && (
              <button type="button" className="btn btn-ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            {step < totalSteps ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <span className="loader-sm"></span> : (
                  <>Complete Setup <Check size={18} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
