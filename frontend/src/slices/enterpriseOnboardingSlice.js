import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createOrganizationApi,
  updateOrganizationApi,
  fetchOrganizationDraftApi,
  fetchOrganizationsListApi,
} from "../api/enterpriseOnboardingApi";

// ============================================================
// CREATE ORGANIZATION - STEP 1
// ============================================================

export const createOrganizationSlice = createAsyncThunk(
  "enterpriseOnboarding/createStep1",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createOrganizationApi(payload);
      return data;
    } catch (error) {
      console.log("Create Organization Step1 API Error:", error);
      console.log("Create Organization Step1 Response:", error.response?.data);

      return rejectWithValue(
        error.response?.data || {
          message: "Failed to save organization details.",
        }
      );
    }
  }
);

export const updateOrganizationSlice = createAsyncThunk(
  "enterpriseOnboarding/updateOrganization",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateOrganizationApi(id, payload);
      return data;
    } catch (error) {
      console.log("Update Organization API Error:", error);
      console.log("Update Organization Response:", error.response?.data);

      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update organization details.",
        }
      );
    }
  }
);

// get draft data
export const fetchOrganizationDraftSlice = createAsyncThunk(
  "enterpriseOnboarding/fetchDraft",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchOrganizationDraftApi(id);
      return data;
    } catch (error) {
      console.log("Fetch Organization Draft API Error:", error);
      console.log("Fetch Organization Draft Response:", error.response?.data);

      return rejectWithValue(
        error.response?.data || {
          message: "Failed to load organization draft.",
        }
      );
    }
  }
);

// ============================================================
// FETCH ORGANIZATIONS LIST
// ============================================================

export const fetchOrganizationsListSlice = createAsyncThunk(
  "enterpriseOnboarding/fetchOrganizationsList",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchOrganizationsListApi(params);
      return data;
    } catch (error) {
      console.log("Fetch Organizations List API Error:", error);
      console.log("Fetch Organizations List Response:", error.response?.data);

      return rejectWithValue(
        error.response?.data || {
          message: "Failed to load organizations list.",
        }
      );
    }
  }
);

// ============================================================
// HELPERS
// ============================================================
// Backend wraps successful responses as:
//   { success: true, message: "...", data: { id, public_id, ... } }
// so the org id always lives at `response.data.id`. The extra
// fallbacks (`payload?.id`, `payload?.organization?.id`) are kept
// only in case some endpoint ever returns an unwrapped shape.
const extractOrgId = (payload) =>
  payload?.data?.id ?? payload?.id ?? payload?.organization?.id ?? null;

// Normalizes the /org/organizations/list/ response into { results, count }.
// Handles three shapes defensively, since the exact contract for this
// endpoint hasn't been confirmed against a live response yet:
//   1. { data: { results: [...], count } }  — paginated (DRF-style)
//   2. { data: [...] }                       — bare array under `data`
//   3. [...]                                 — bare array, no envelope
// Update this once the real response shape is confirmed.
const extractOrgList = (payload) => {
  const data = payload?.data;

  if (Array.isArray(data?.results)) {
    return { results: data.results, count: data.count ?? data.results.length };
  }
  if (Array.isArray(data)) {
    return { results: data, count: data.length };
  }
  if (Array.isArray(payload)) {
    return { results: payload, count: payload.length };
  }
  return { results: [], count: 0 };
};

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  step1Loading: false,
  step1Success: false,
  organizationId: null,
  step1Error: null,

  updateLoading: false,
  updateSuccess: false,
  updateError: null,

  draftLoading: false,
  draftData: null,
  draftError: null,

  organizationsList: [],
  organizationsCount: 0,
  organizationsListLoading: false,
  organizationsListError: null,
};

// ============================================================
// SLICE
// ============================================================

const enterpriseOnboardingSlice = createSlice({
  name: "enterpriseOnboarding",

  initialState,

  reducers: {
    resetEnterpriseOnboardingState: (state) => {
      state.step1Loading = false;
      state.step1Success = false;
      state.organizationId = null;
      state.step1Error = null;

      state.updateLoading = false;
      state.updateSuccess = false;
      state.updateError = null;

      state.draftLoading = false;
      state.draftData = null;
      state.draftError = null;

      state.organizationsList = [];
      state.organizationsCount = 0;
      state.organizationsListLoading = false;
      state.organizationsListError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(createOrganizationSlice.pending, (state) => {
        state.step1Loading = true;
        state.step1Success = false;
        state.step1Error = null;
      })
      .addCase(createOrganizationSlice.fulfilled, (state, action) => {
        state.step1Loading = false;
        state.step1Success = true;
        state.organizationId = extractOrgId(action.payload);
        state.step1Error = null;
      })
      .addCase(createOrganizationSlice.rejected, (state, action) => {
        state.step1Loading = false;
        state.step1Success = false;
        state.step1Error = action.payload;
      })

      .addCase(updateOrganizationSlice.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.updateError = null;
      })
      .addCase(updateOrganizationSlice.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        // Keep organizationId in sync in case the API echoes it back;
        // falls back to the existing id if this response doesn't include one.
        state.organizationId = extractOrgId(action.payload) ?? state.organizationId;
        state.updateError = null;
      })
      .addCase(updateOrganizationSlice.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = false;
        state.updateError = action.payload;
      })

      .addCase(fetchOrganizationDraftSlice.pending, (state) => {
        state.draftLoading = true;
        state.draftError = null;
      })
      .addCase(fetchOrganizationDraftSlice.fulfilled, (state, action) => {
        state.draftLoading = false;
        state.draftData = action.payload;
        state.draftError = null;
      })
      .addCase(fetchOrganizationDraftSlice.rejected, (state, action) => {
        state.draftLoading = false;
        state.draftError = action.payload;
      })

      .addCase(fetchOrganizationsListSlice.pending, (state) => {
        state.organizationsListLoading = true;
        state.organizationsListError = null;
      })
      .addCase(fetchOrganizationsListSlice.fulfilled, (state, action) => {
        state.organizationsListLoading = false;
        const { results, count } = extractOrgList(action.payload);
        state.organizationsList = results;
        state.organizationsCount = count;
        state.organizationsListError = null;
      })
      .addCase(fetchOrganizationsListSlice.rejected, (state, action) => {
        state.organizationsListLoading = false;
        state.organizationsListError = action.payload;
      });
  },
});

export const { resetEnterpriseOnboardingState } = enterpriseOnboardingSlice.actions;
export default enterpriseOnboardingSlice.reducer;