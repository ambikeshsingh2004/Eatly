import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await signup(
        formData.email, 
        formData.password, 
        formData.fullName
      );
      
      if (response.success) {
        // Auto login after signup
        const loginResponse = await login(formData.email, formData.password);
        if (loginResponse.success) {
          navigate('/onboarding');
        }
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 'weak', text: 'Weak' };
    if (password.length < 10) return { level: 'medium', text: 'Medium' };
    return { level: 'strong', text: 'Strong' };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo */}
          <Link to="/" className="auth-logo">
            <Sparkles size={32} />
            <span>Eatly</span>
          </Link>

          {/* Header */}
          <div className="auth-header">
            <h1 className="heading-3">Create your account</h1>
            <p className="text-secondary">Start your personalized health journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {strength && (
                <div className={`password-strength strength-${strength.level}`}>
                  <div className="strength-bar">
                    <div className="strength-fill"></div>
                  </div>
                  <span>{strength.text}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check size={18} className="input-check" />
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loader-sm"></span>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="auth-decoration">
          <div className="auth-circle auth-circle-1"></div>
          <div className="auth-circle auth-circle-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
