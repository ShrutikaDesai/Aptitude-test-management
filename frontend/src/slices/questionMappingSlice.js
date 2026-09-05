import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssessmentVersionGrades,
  getQuestionsByGradeAndTag,
} from "@/api/questionMappingApi";

// ---------------------------------------------------------------------------
// Fetch questions by Grade(s) + Tag(s)
// ---------------------------------------------------------------------------

// gradeIds/tagIds are arrays of selected filter values (strings). The
// caller (component) is responsible for only dispatching this once both
// arrays are non-empty.
export const fetchQuestionsByGradeAndTag = createAsyncThunk(
  "questionMapping/fetchQuestionsByGradeAndTag",
  async ({ gradeIds, tagIds }, { rejectWithValue }) => {
    try {
      const response = await getQuestionsByGradeAndTag(gradeIds, tagIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data ?? error.message);
    }
  }
);

// ---------------------------------------------------------------------------
// Existing Grade thunk
// ---------------------------------------------------------------------------

export const fetchAssessmentVersionGrades = createAsyncThunk(
  "questionMapping/fetchAssessmentVersionGrades",
  async (versionId, { rejectWithValue }) => {
    try {
      const response = await getAssessmentVersionGrades(versionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data ?? error.message);
    }
  }
);

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState = {
  versionGrades: [],
  versionGradesLoading: false,
  versionGradesError: null,

  questionsByGradeTag: [],
  questionsByGradeTagLoading: false,
  questionsByGradeTagError: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const questionMappingSlice = createSlice({
  name: "questionMapping",
  initialState,

  reducers: {
    resetVersionGrades: (state) => {
      state.versionGrades = [];
      state.versionGradesLoading = false;
      state.versionGradesError = null;
    },
    resetQuestionsByGradeTag: (state) => {
      state.questionsByGradeTag = [];
      state.questionsByGradeTagLoading = false;
      state.questionsByGradeTagError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ---- Assessment Version Grades ----
      .addCase(fetchAssessmentVersionGrades.pending, (state) => {
        state.versionGradesLoading = true;
        state.versionGradesError = null;
      })
      .addCase(fetchAssessmentVersionGrades.fulfilled, (state, action) => {
        state.versionGradesLoading = false;
        const payload = action.payload;
        state.versionGrades = Array.isArray(payload)
          ? payload
          : payload?.data?.grades ?? payload?.grades ?? payload?.results ?? [];
      })
      .addCase(fetchAssessmentVersionGrades.rejected, (state, action) => {
        state.versionGradesLoading = false;
        state.versionGradesError = action.payload ?? "Failed to fetch version grades.";
      })

      // ---- Questions by Grade + Tag ----
      .addCase(fetchQuestionsByGradeAndTag.pending, (state) => {
        state.questionsByGradeTagLoading = true;
        state.questionsByGradeTagError = null;
      })
      .addCase(fetchQuestionsByGradeAndTag.fulfilled, (state, action) => {
        state.questionsByGradeTagLoading = false;
        const payload = action.payload;
        // Shape not yet confirmed — adjust once a real payload is seen,
        // same as versionGrades/tags above.
        state.questionsByGradeTag = Array.isArray(payload)
          ? payload
          : payload?.data?.questions ?? payload?.data ?? payload?.questions ?? payload?.results ?? [];
      })
      .addCase(fetchQuestionsByGradeAndTag.rejected, (state, action) => {
        state.questionsByGradeTagLoading = false;
        state.questionsByGradeTagError = action.payload ?? "Failed to fetch questions by grade and tag.";
      });
  },
});

export const { resetVersionGrades, resetQuestionsByGradeTag } = questionMappingSlice.actions;
export default questionMappingSlice.reducer;