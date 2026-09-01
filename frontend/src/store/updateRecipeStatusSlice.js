import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export const updateRecipeStatus = createAsyncThunk(
  "myRecipes/updateRecipeStatus",
  async ({ id, is_public }, thunkAPI) => {
    try {
      const state = thunkAPI.getState()
      const token = state.auth?.token

      const response = await axios.patch(
        `/recipes/${id}/status`,
        { is_public },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      )

      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
  },
)

const updateRecipeStatusSlice = createSlice({
  name: "updateRecipeStatus",
  initialState: { loading: false, error: null },
  reducers: {
    clearStatusError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateRecipeStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRecipeStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateRecipeStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearStatusError } = updateRecipeStatusSlice.actions

export default updateRecipeStatusSlice.reducer
