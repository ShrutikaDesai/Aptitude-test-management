import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createTagApi,
  getTagsApi,
  updateTagApi,
  deleteTagApi,
} from "../api/tagApi";

// ================= CREATE TAG =================

export const createTag = createAsyncThunk(
  "tag/createTag",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createTagApi(payload);
      return data;
    } catch (error) {
      console.log("Create Tag API Error:", error.response);
      console.log("Response Data:", error.response?.data);

      return rejectWithValue(
        error.response?.data || "Failed to create tag"
      );
    }
  }
);

// ================= GET TAGS =================

export const fetchTags = createAsyncThunk(
  "tag/fetchTags",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getTagsApi();
      return data;
    } catch (error) {
      console.log("Get Tags API Error:", error.response);

      return rejectWithValue(
        error.response?.data || "Failed to fetch tags"
      );
    }
  }
);

// ================= UPDATE TAG =================

export const updateTag = createAsyncThunk(
  "tag/updateTag",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateTagApi(id, payload);
      return data;
    } catch (error) {
      console.log("Update Tag API Error:", error.response);

      return rejectWithValue(
        error.response?.data || "Failed to update tag"
      );
    }
  }
);

// ================= DELETE TAG =================

export const deleteTag = createAsyncThunk(
  "tag/deleteTag",
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteTagApi(id);
      return { id, data };
    } catch (error) {
      console.log("Delete Tag API Error:", error.response);

      return rejectWithValue(
        error.response?.data || "Failed to delete tag"
      );
    }
  }
);

// ================= INITIAL STATE =================

const initialState = {
  loading: false,
  success: false,

  tag: null,
  tags: [],

  tagsLoading: false,
  tagsError: null,

  error: null,
};

// ================= SLICE =================

const tagSlice = createSlice({
  name: "tag",
  initialState,

  reducers: {
    resetTagState: (state) => {
      state.loading = false;
      state.success = false;
      state.tag = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= CREATE TAG =================

      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.tag = action.payload;
      })

      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ================= GET TAGS =================

      .addCase(fetchTags.pending, (state) => {
        state.tagsLoading = true;
        state.tagsError = null;
      })

      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tagsLoading = false;

        const payload = action.payload;

        const nestedData =
          payload?.results?.data ??
          payload?.data?.data ??
          payload?.data ??
          payload?.results;

        if (Array.isArray(payload)) {
          state.tags = payload;
        } else if (Array.isArray(nestedData)) {
          state.tags = nestedData;
        } else {
          state.tags = [];
        }
      })

      .addCase(fetchTags.rejected, (state, action) => {
        state.tagsLoading = false;
        state.tagsError = action.payload;
      })

      // ================= UPDATE TAG =================

      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.tag = action.payload;
      })

      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ================= DELETE TAG =================

      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.tags = state.tags.filter(
          (tag) => tag.id !== action.payload.id
        );
      })

      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetTagState } = tagSlice.actions;

export default tagSlice.reducer;