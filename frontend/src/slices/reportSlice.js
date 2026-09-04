import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getReportTemplates } from "@/api/reportApi";

// Normalize report template list response — same shapes assessmentSlice
// handles ({ results: { data } }, { data }, bare array, etc.)
const normalizeReportTemplateList = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.results?.data)) {
    return payload.results.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.reportTemplates)) {
    return payload.reportTemplates;
  }

  return [];
};

// Fetch Report Templates — powers the Report Template dropdown
export const fetchReportTemplatesSlice = createAsyncThunk(
  "report/reportTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReportTemplates();

      return normalizeReportTemplateList(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Something went wrong"
      );
    }
  }
);

const reportSlice = createSlice({
  name: "report",

  initialState: {
    reportTemplates: [],
    reportTemplatesLoading: false,
    reportTemplatesError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // =========================
      // REPORT TEMPLATES (dropdown)
      // =========================
      .addCase(fetchReportTemplatesSlice.pending, (state) => {
        state.reportTemplatesLoading = true;
        state.reportTemplatesError = null;
      })

      .addCase(fetchReportTemplatesSlice.fulfilled, (state, action) => {
        state.reportTemplatesLoading = false;
        state.reportTemplates = action.payload;
      })

      .addCase(fetchReportTemplatesSlice.rejected, (state, action) => {
        state.reportTemplatesLoading = false;
        state.reportTemplatesError = action.payload;
      });
  },
});

export default reportSlice.reducer;