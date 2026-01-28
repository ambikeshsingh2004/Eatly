import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Camera, 
  ShoppingCart, 
  ChefHat, 
  Flame, 
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: <ShoppingCart size={32} />,
      title: 'Smart Grocery Planner',
      description: 'Get a personalized 3-day meal plan with a complete shopping list tailored to your goals.'
    },
    {
      icon: <Camera size={32} />,
      title: 'Ingredient Scanner',
      description: 'Snap a photo of your ingredients and get healthy recipe suggestions instantly.'
    },
    {
      icon: <ChefHat size={32} />,
      title: 'Recipe Finder',
      description: 'Search any dish and get step-by-step recipes with complete nutrition info.'
    },
    {
      icon: <Flame size={32} />,
      title: 'Streak Tracking',
      description: 'Stay motivated with daily calorie and exercise streaks. Never break the chain!'
    }
  ];

  const benefits = [
    'Personalized nutrition targets',
    'AI-powered meal suggestions',
    'Track calories & macros',
    'Exercise recommendations',
    'Beautiful dark interface',
    '100% free to use'
  ];

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <Link to="/" className="logo">
            <Sparkles className="logo-icon" />
            <span>Eatly</span>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Powered by AI</span>
            </div>
            <h1 className="heading-1">
              Your Personal
              <span className="text-gradient"> AI Nutritionist</span>
            </h1>
            <p className="hero-description">
              Transform your health journey with smart meal planning, 
              ingredient recognition, and personalized nutrition tracking.
              All powered by cutting-edge AI.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                I have an account
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">100+</span>
                <span className="stat-label">Recipes</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">AI</span>
                <span className="stat-label">Powered</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">Free</span>
                <span className="stat-label">Forever</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-glow"></div>
              <div className="hero-card-content">
                <div className="mock-header">
                  <div className="mock-avatar"></div>
                  <div>
                    <div className="mock-title">Today's Plan</div>
                    <div className="mock-subtitle">1,800 kcal target</div>
                  </div>
                </div>
                <div className="mock-meals">
                  <div className="mock-meal">
                    <span>🍳</span>
                    <div>
                      <div className="mock-meal-name">Breakfast</div>
                      <div className="mock-meal-cal">420 kcal</div>
                    </div>
                  </div>
                  <div className="mock-meal">
                    <span>🥗</span>
                    <div>
                      <div className="mock-meal-name">Lunch</div>
                      <div className="mock-meal-cal">580 kcal</div>
                    </div>
                  </div>
                  <div className="mock-meal">
                    <span>🍝</span>
                    <div>
                      <div className="mock-meal-name">Dinner</div>
                      <div className="mock-meal-cal">650 kcal</div>
                    </div>
                  </div>
                </div>
                <div className="mock-progress">
                  <div className="mock-progress-bar">
                    <div className="mock-progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <span>75% of daily goal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="heading-2">
              Everything you need for
              <span className="text-gradient"> healthy eating</span>
            </h2>
            <p>Four powerful features to transform your nutrition journey</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card card card-interactive"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="heading-4">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="heading-2">
                Why choose <span className="text-gradient">Eatly?</span>
              </h2>
              <p className="text-secondary">
                We combine the power of AI with nutritional science to give you 
                the most personalized health experience.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <Check size={20} className="check-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started Now <ArrowRight size={20} />
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="streak-card card">
                <div className="streak-header">
                  <Flame size={24} className="streak-icon" />
                  <span>Current Streak</span>
                </div>
                <div className="streak-value">
                  <span className="streak-number">7</span>
                  <span className="streak-label">days</span>
                </div>
                <div className="streak-message">You're on fire! 🔥</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="heading-2">Ready to transform your health?</h2>
            <p className="text-secondary">
              Join thousands of users who are eating smarter with Eatly.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Your Journey <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Sparkles size={24} />
              <span>Eatly</span>
            </div>
            <p className="text-muted">
              © 2024 Eatly. Built with ❤️ and AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
