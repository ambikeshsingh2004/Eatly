import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, profileService } from '../../services/services';

// Async Thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { user: null, profile: null, isOnboarded: false };
      }

      const response = await authService.getUser();
      if (response.success) {
        return {
          user: response.data.user,
          profile: response.data,
          isOnboarded: response.data.user?.onboardingComplete || false
        };
      }
      return rejectWithValue('Failed to authenticate');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        // Fetch full profile
        let profile = null;
        try {
          const profileRes = await profileService.getProfile();
          if (profileRes.success) {
            profile = profileRes.data;
          }
        } catch (e) {
          console.error('Failed to fetch profile:', e);
        }

        return {
          user: response.data.user,
          profile,
          isOnboarded: response.data.onboardingComplete || false,
          session: response.data.session
        };
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'An error occurred');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      const response = await authService.signup(email, password, fullName);

      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Signup failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'An error occurred');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshProfile = createAsyncThunk(
  'auth/refreshProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        return {
          profile: response.data,
          isOnboarded: response.data.profile?.onboardingComplete || false
        };
      }
      return rejectWithValue('Failed to fetch profile');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  user: null,
  profile: null,
  isOnboarded: false,
  loading: true,
  loginLoading: false,
  signupLoading: false,
  error: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnboarded: (state, action) => {
      state.isOnboarded = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isOnboarded = action.payload.isOnboarded;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.isOnboarded = false;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isOnboarded = action.payload.isOnboarded;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
      })

      // Signup
      .addCase(signup.pending, (state) => {
        state.signupLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.signupLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.signupLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isOnboarded = false;
      })

      // Refresh Profile
      .addCase(refreshProfile.fulfilled, (state, action) => {
        state.profile = action.payload.profile;
        state.isOnboarded = action.payload.isOnboarded;
      });
  }
});

export const { clearError, setOnboarded } = authSlice.actions;
export default authSlice.reducer;
