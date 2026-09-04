import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    publishAssessment,
    updateAssessmentDraft,
    getAssessmentList,
    getAssessmentDetail,
    getAssessments,
} from "@/api/assessmentApi";

// Create / Publish Assessment
export const publishAssessmentSlice = createAsyncThunk(
    "assessment/publish",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await publishAssessment(payload);
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data ||
                error.message ||
                "Something went wrong"
            );
        }
    }
);

// Update existing draft assessment
export const updateAssessmentDraftSlice = createAsyncThunk(
    "assessment/updateDraft",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await updateAssessmentDraft(id, payload);
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data ||
                error.message ||
                "Something went wrong"
            );
        }
    }
);

// Normalize assessment list response
const normalizeAssessmentList = (payload) => {
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

    if (Array.isArray(payload?.assessmentList)) {
        return payload.assessmentList;
    }

    return [];
};

// Fetch Assessment List
export const fetchAssessmentListSlice = createAsyncThunk(
    "assessment/list",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAssessmentList();

            return normalizeAssessmentList(response);
        } catch (error) {
            return rejectWithValue(
                error.response?.data ||
                error.message ||
                "Something went wrong"
            );
        }
    }
);

// Fetch Assessment  darft Detail
export const fetchAssessmentDetailSlice = createAsyncThunk(
    "assessment/detail",
    async (id, { rejectWithValue }) => {
        try {
            const response = await getAssessmentDetail(id);

            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data ||
                error.message ||
                "Something went wrong"
            );
        }
    }
);

// Fetch master Assessments list — powers the Assessment Name autocomplete
export const fetchAssessmentNamesSlice = createAsyncThunk(
    "assessment/names",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAssessments();

            return normalizeAssessmentList(response);
        } catch (error) {
            return rejectWithValue(
                error.response?.data ||
                error.message ||
                "Something went wrong"
            );
        }
    }
);

const assessmentSlice = createSlice({
    name: "assessment",

    initialState: {
        loading: false,
        data: null,
        error: null,
        success: false,

        assessmentList: [],
        listLoading: false,
        listError: null,

        detail: null,
        detailLoading: false,
        detailError: null,

        assessmentNames: [],
        namesLoading: false,
        namesError: null,
    },

    reducers: {
        resetPublishState: (state) => {
            state.loading = false;
            state.data = null;
            state.error = null;
            state.success = false;
        },

        resetAssessmentDetail: (state) => {
            state.detail = null;
            state.detailLoading = false;
            state.detailError = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // =========================
            // CREATE / PUBLISH
            // =========================
            .addCase(publishAssessmentSlice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(publishAssessmentSlice.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload;
            })

            .addCase(publishAssessmentSlice.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            })

            // =========================
            // UPDATE DRAFT
            // =========================
            .addCase(updateAssessmentDraftSlice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(updateAssessmentDraftSlice.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload;
            })

            .addCase(updateAssessmentDraftSlice.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            })

            // =========================
            // ASSESSMENT LIST
            // =========================
            .addCase(fetchAssessmentListSlice.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })

            .addCase(fetchAssessmentListSlice.fulfilled, (state, action) => {
                state.listLoading = false;
                state.assessmentList = action.payload;
            })

            .addCase(fetchAssessmentListSlice.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            })

            // =========================
            // ASSESSMENT DETAIL
            // =========================
            .addCase(fetchAssessmentDetailSlice.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })

            .addCase(fetchAssessmentDetailSlice.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detail = action.payload;
            })

            .addCase(fetchAssessmentDetailSlice.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            })

            // =========================
            // ASSESSMENT NAMES (dropdown)
            // =========================
            .addCase(fetchAssessmentNamesSlice.pending, (state) => {
                state.namesLoading = true;
                state.namesError = null;
            })

            .addCase(fetchAssessmentNamesSlice.fulfilled, (state, action) => {
                state.namesLoading = false;
                state.assessmentNames = action.payload;
            })

            .addCase(fetchAssessmentNamesSlice.rejected, (state, action) => {
                state.namesLoading = false;
                state.namesError = action.payload;
            });
    },
});

export const {
    resetPublishState,
    resetAssessmentDetail,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;