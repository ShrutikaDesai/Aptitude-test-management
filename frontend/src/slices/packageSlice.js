import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createPackageApi,
  getPackagesApi,
  updatePackageApi,
  deletePackageApi,
  getPackageByIdApi,
} from "../api/packageApi";

// ================= CREATE PACKAGE =================

export const createPackage = createAsyncThunk(
  "package/createPackage",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createPackageApi(payload);
      return data;
    } catch (error) {
      console.log("Create Package API Error:", error.response);
      console.log("Response Data:", error.response?.data);

      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ================= GET PACKAGES =================

export const fetchPackages = createAsyncThunk(
  "package/fetchPackages",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getPackagesApi();
      return data;
    } catch (error) {
      console.log("Get Packages API Error:", error.response);

      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ================= GET PACKAGE BY ID =================

export const fetchPackageById = createAsyncThunk(
  "package/fetchPackageById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getPackageByIdApi(id);
      return data;
    } catch (error) {
      console.log("Get Package By ID API Error:", error.response);

      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ================= UPDATE PACKAGE =================

export const updatePackage = createAsyncThunk(
  "package/updatePackage",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updatePackageApi(id, payload);
      return data;
    } catch (error) {
      console.log("Update Package API Error:", error.response);

      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ================= DELETE PACKAGE =================

export const deletePackage = createAsyncThunk(
  "package/deletePackage",
  async (id, { rejectWithValue }) => {
    try {
      const data = await deletePackageApi(id);
      return { id, data };
    } catch (error) {
      console.log("Delete Package API Error:", error.response);

      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ================= INITIAL STATE =================

const initialState = {
  loading: false,
  success: false,

  package: null,
  packages: [],

  packagesLoading: false,
  packagesError: null,

  error: null,
};

// ================= SLICE =================

const packageSlice = createSlice({
  name: "package",

  initialState,

  reducers: {
    resetPackageState: (state) => {
      state.loading = false;
      state.success = false;
      state.package = null;
      state.error = null;
    },

    clearPackageError: (state) => {
      state.error = null;
      state.packagesError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // CREATE PACKAGE
      // =====================================================

      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.package = action.payload;

        // Add newly created package to list if available
        const newPackage =
          action.payload?.data ?? action.payload;

        if (newPackage) {
          state.packages = [newPackage, ...state.packages];
        }
      })

      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // =====================================================
      // GET PACKAGES
      // =====================================================

      .addCase(fetchPackages.pending, (state) => {
        state.packagesLoading = true;
        state.packagesError = null;
      })

      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.packagesLoading = false;

        const payload = action.payload;

        const nestedData =
          payload?.results?.data ??
          payload?.data?.data ??
          payload?.data ??
          payload?.results;

        if (Array.isArray(payload)) {
          state.packages = payload;
        } else if (Array.isArray(nestedData)) {
          state.packages = nestedData;
        } else {
          state.packages = [];
        }
      })

      .addCase(fetchPackages.rejected, (state, action) => {
        state.packagesLoading = false;
        state.packagesError = action.payload;
      })

      // =====================================================
      // GET PACKAGE BY ID
      // =====================================================

      .addCase(fetchPackageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.loading = false;
        state.package = action.payload;
      })

      .addCase(fetchPackageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE PACKAGE
      // =====================================================

      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updatePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.package = action.payload;

        const updatedPackage =
          action.payload?.data ?? action.payload;

        if (updatedPackage?.id) {
          state.packages = state.packages.map((pkg) =>
            pkg.id === updatedPackage.id
              ? updatedPackage
              : pkg
          );
        }
      })

      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // =====================================================
      // DELETE PACKAGE
      // =====================================================

      .addCase(deletePackage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deletePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.packages = state.packages.filter(
          (pkg) => pkg.id !== action.payload.id
        );
      })

      .addCase(deletePackage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

// ================= ACTIONS =================

export const {
  resetPackageState,
  clearPackageError,
} = packageSlice.actions;

// ================= REDUCER =================

export default packageSlice.reducer;

