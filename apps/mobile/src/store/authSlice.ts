import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api';

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
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
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => {
    const response = await authAPI.login(data.email, data.password);
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  }
);

export const restoreToken = createAsyncThunk('auth/restoreToken', async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('token');
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

