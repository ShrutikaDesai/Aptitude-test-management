import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAssessmentQuestionsApi } from "../../api/student-api/studentAssessmentApi";

// ================= FETCH ASSESSMENT QUESTIONS =================
// Pass the registration id explicitly, or it falls back to the one
// saved in localStorage after registration.

export const fetchAssessmentQuestions = createAsyncThunk(
  "studentAssessment/fetchAssessmentQuestions",
  async (registrationId, { rejectWithValue }) => {
    try {
      const id = registrationId || localStorage.getItem("registration_id");

      if (!id) {
        return rejectWithValue({ message: "Registration ID not found." });
      }

      const data = await getAssessmentQuestionsApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to load assessment questions" }
      );
    }
  }
);

// ================= SLICE =================

const studentAssessmentSlice = createSlice({
  name: "studentAssessment",

  initialState: {
    questions: null, // full API response (data)
    assessmentLoading: false,
    assessmentError: null,
  },

  reducers: {
    clearAssessment: (state) => {
      state.questions = null;
      state.assessmentLoading = false;
      state.assessmentError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentQuestions.pending, (state) => {
        state.assessmentLoading = true;
        state.assessmentError = null;
      })
      .addCase(fetchAssessmentQuestions.fulfilled, (state, action) => {
        state.assessmentLoading = false;
        state.questions = action.payload?.data ?? action.payload;
      })
      .addCase(fetchAssessmentQuestions.rejected, (state, action) => {
        state.assessmentLoading = false;
        state.assessmentError = action.payload;
      });
  },
});

export const { clearAssessment } = studentAssessmentSlice.actions;

export default studentAssessmentSlice.reducer;