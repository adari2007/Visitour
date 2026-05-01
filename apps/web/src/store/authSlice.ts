import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/services/api';

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const response = await authAPI.register(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );
    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => {
    const response = await authAPI.login(data.email, data.password);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

