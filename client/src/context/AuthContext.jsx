import { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await authService.getUser();
        if (response.success) {
          setUser(response.data.user);
          setProfile(response.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName) => {
    const response = await authService.signup(email, password, fullName);
    return response;
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.data.user);
      // Set initial profile data from login response
      setProfile({ user: response.data.user });
      
      // Fetch full profile in background
      try {
        const profileRes = await profileService.getProfile();
        if (profileRes.success) {
          setProfile(profileRes.data);
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signup,
    login,
    logout,
    refreshProfile,
    isOnboarded: profile?.profile?.onboardingComplete || profile?.user?.onboardingComplete || user?.onboardingComplete || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
