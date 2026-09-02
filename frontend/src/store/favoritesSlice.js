import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../utils/axiosInstance"

export const getFavorites = createAsyncThunk(
  "favorites/getFavorites",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/favorites")
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch favorites" },
      )
    }
  },
)

export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (recipeId, thunkAPI) => {
    try {
      await axios.post(`/favorites/${recipeId}`)
      return recipeId
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to like recipe" },
      )
    }
  },
)

export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (recipeId, thunkAPI) => {
    try {
      await axios.delete(`/favorites/${recipeId}`)
      return recipeId
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to unlike recipe" },
      )
    }
  },
)

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { favorites: [], loading: false, error: null },
  reducers: {
    setFavorites(state, action) {
      state.favorites = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFavorite.pending, (state, action) => {
        const recipeId = action.meta.arg
        if (!state.favorites.find((f) => f.id === recipeId)) {
          state.favorites.push({ id: recipeId, optimistic: true })
        }
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const recipeId = action.payload
        state.favorites = state.favorites.map((fav) =>
          fav.id === recipeId ? { ...fav, optimistic: false } : fav,
        )
      })
      .addCase(addFavorite.rejected, (state, action) => {
        const failedId = action.meta.arg
        state.favorites = state.favorites.filter((fav) => fav.id !== failedId)
        state.error = action.payload?.message || "Failed to like recipe"
      })
      .addCase(removeFavorite.pending, (state, action) => {
        const recipeId = action.meta.arg
        state.favorites = state.favorites.filter((fav) => fav.id !== recipeId)
      })
      .addCase(removeFavorite.fulfilled, (state) => {})
      .addCase(removeFavorite.rejected, (state, action) => {
        const failedId = action.meta.arg
        state.favorites.push({ id: failedId, rollback: true })
        state.error = action.payload?.message || "Failed to unlike recipe"
      })
      .addCase(getFavorites.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.loading = false
        state.favorites = action.payload
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
  },
})

export const { setFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
