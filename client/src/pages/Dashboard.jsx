import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { streakService } from '../services/services';
import { 
  Sparkles, 
  ShoppingCart, 
  Camera, 
  ChefHat, 
  Flame,
  LogOut,
  User,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isOnboarded } = useAuth();
  const [streaks, setStreaks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to onboarding if not completed
    if (!isOnboarded) {
      navigate('/onboarding');
      return;
    }
    
    fetchStreaks();
  }, [isOnboarded, navigate]);

  const fetchStreaks = async () => {
    try {
      const response = await streakService.getStreaks();
      if (response.success) {
        setStreaks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const features = [
    {
      icon: <ShoppingCart size={28} />,
      title: 'Grocery Planner',
      description: 'Get a personalized 3-day meal plan with shopping list',
      link: '/grocery-planner',
      color: 'green'
    },
    {
      icon: <Camera size={28} />,
      title: 'Ingredient Scanner',
      description: 'Snap ingredients & get healthy recipe suggestions',
      link: '/ingredient-scanner',
      color: 'purple'
    },
    {
      icon: <ChefHat size={28} />,
      title: 'Recipe Finder',
      description: 'Search any dish and get detailed recipes',
      link: '/recipe-finder',
      color: 'orange'
    }
  ];

  const userProfile = profile?.profile;
  const macros = userProfile ? {
    calories: userProfile.dailyCalories,
    protein: userProfile.dailyProtein,
    carbs: userProfile.dailyCarbs,
    fats: userProfile.dailyFats
  } : null;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <Link to="/dashboard" className="logo">
            <Sparkles size={24} />
            <span>Eatly</span>
          </Link>
          <nav className="dashboard-nav">
            <Link to="/streaks" className="nav-item">
              <Flame size={20} />
              <span>Streaks</span>
            </Link>
            <button className="nav-item" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-badge">
                <Zap size={14} />
                <span>AI-Powered</span>
              </div>
              <h1 className="heading-2">
                Welcome back, <span className="text-gradient">{userProfile?.fullName?.split(' ')[0] || 'User'}!</span>
              </h1>
              <p className="text-secondary">
                Ready to make healthy choices today? Let's crush your {userProfile?.goal?.replace('_', ' ')} goals!
              </p>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="stats-section">
            <div className="stats-grid">
              {/* Daily Targets Card */}
              <div className="stat-card targets-card">
                <div className="stat-header">
                  <Target size={20} />
                  <span>Daily Targets</span>
                </div>
                {macros && (
                  <div className="macro-grid">
                    <div className="macro-item">
                      <span className="macro-value">{macros.calories}</span>
                      <span className="macro-label">Calories</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{macros.protein}g</span>
                      <span className="macro-label">Protein</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{macros.carbs}g</span>
                      <span className="macro-label">Carbs</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{macros.fats}g</span>
                      <span className="macro-label">Fats</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Streaks Card */}
              <Link to="/streaks" className="stat-card streak-card">
                <div className="stat-header">
                  <Flame size={20} />
                  <span>Your Streaks</span>
                </div>
                <div className="streak-grid">
                  <div className="streak-item">
                    <span className="streak-value">{streaks?.calorieStreak || 0}</span>
                    <span className="streak-label">Calorie Streak</span>
                  </div>
                  <div className="streak-item">
                    <span className="streak-value">{streaks?.exerciseStreak || 0}</span>
                    <span className="streak-label">Exercise Streak</span>
                  </div>
                </div>
                <div className="streak-best">
                  🏆 Best: {Math.max(streaks?.calorieBestStreak || 0, streaks?.exerciseBestStreak || 0)} days
                </div>
              </Link>

              {/* Profile Card */}
              <div className="stat-card profile-card">
                <div className="stat-header">
                  <User size={20} />
                  <span>Profile</span>
                </div>
                <div className="profile-info">
                  <div className="profile-avatar">
                    {userProfile?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="profile-details">
                    <span className="profile-name">{userProfile?.fullName}</span>
                    <span className="profile-goal">
                      <TrendingUp size={14} />
                      {userProfile?.goal?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2 className="heading-4">What would you like to do?</h2>
            <div className="feature-cards">
              {features.map((feature, index) => (
                <Link 
                  key={index} 
                  to={feature.link} 
                  className={`feature-card card-${feature.color}`}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
