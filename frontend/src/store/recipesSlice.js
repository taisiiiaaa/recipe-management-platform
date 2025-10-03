import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../store/axiosInstance'

export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (filters = {}, thunkAPI) => {
    try {
      const response = await axios.get('http://localhost:3000/recipes/recipes', {
        params: filters
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch recipes' });
    }
  }
);
const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  }
});

export default recipesSlice.reducer;
