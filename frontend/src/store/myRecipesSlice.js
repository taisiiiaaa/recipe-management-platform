import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchMyRecipes = createAsyncThunk(
  'myRecipes/fetchMyRecipes',
  async ({ searchTerm, status } = {}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token;

      const params = {};
      if (searchTerm?.trim()) params.searchTerm = searchTerm;
      if (status) params.status = status;

      const response = await axios.get('http://localhost:3000/recipes/mine', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  'myRecipes/deleteRecipe',
  async (recipeId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token;

      await axios.delete(`http://localhost:3000/recipes/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      return recipeId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const myRecipesSlice = createSlice({
    name: 'myRecipes',
    initialState: {
    recipes: [],
    loading: false,
    error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
    builder
        .addCase(fetchMyRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(fetchMyRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
        })
        .addCase(fetchMyRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        })
        .addCase(deleteRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(deleteRecipe.fulfilled, (state, action) => {
          state.loading = false;
          state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
        })
        .addCase(deleteRecipe.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
});

export default myRecipesSlice.reducer;
