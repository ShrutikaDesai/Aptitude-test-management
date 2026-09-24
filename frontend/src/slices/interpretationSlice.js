  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

  import {
    getAssessmentsWithVersionsApi,
    bulkCreateInterpretationRulesApi,
    bulkUpdateInterpretationRulesApi,
    getInterpretationDraftByVersionApi,
    getInterpretationRulesByVersionApi,
  } from "../api/interpretationApi";

  // ============================================================
  // GET ASSESSMENTS WITH VERSIONS
  // ============================================================

  export const fetchAssessmentsWithVersions = createAsyncThunk(
    "interpretation/fetchAssessmentsWithVersions",
    async (_, { rejectWithValue }) => {
      try {
        const response = await getAssessmentsWithVersionsApi();

        return response;
      } catch (error) {
        console.error(
          "Get Assessments With Versions API Error:",
          error.response
        );

        return rejectWithValue(
          error.response?.data || {
            message: "Failed to fetch assessments with versions",
          }
        );
      }
    }
  );

  // ============================================================
  // BULK CREATE INTERPRETATION RULES
  // ============================================================

  export const createInterpretationRules = createAsyncThunk(
    "interpretation/createInterpretationRules",
    async (payload, { rejectWithValue }) => {
      try {
        const response = await bulkCreateInterpretationRulesApi(payload);

        return response;
      } catch (error) {
        console.error(
          "Bulk Create Interpretation Rules API Error:",
          error.response
        );

        return rejectWithValue(
          error.response?.data || {
            message: "Failed to create interpretation rules",
          }
        );
      }
    }
  );

  // ============================================================
  // BULK UPDATE INTERPRETATION RULES
  // ============================================================
  export const updateInterpretationRules = createAsyncThunk( 
    "interpretation/updateInterpretationRules", 
    async (payload, { rejectWithValue }) => { 
      try { 
        const response = await bulkUpdateInterpretationRulesApi(payload); 
        return response; 
      } catch (error) { 
        console.error( 
          "Bulk Update Interpretation Rules API Error:", 
          error.response 
        );
        return rejectWithValue( 
          error.response?.data || { 
          message: "Failed to update interpretation rules", 
        } 
      ); 
    } 
  }
  );


  // ============================================================
  // GET INTERPRETATION DRAFT BY VERSION
  // ============================================================

  export const fetchInterpretationDraftByVersion = createAsyncThunk(
    "interpretation/fetchInterpretationDraftByVersion",
    async (versionId, { rejectWithValue }) => {
      try {
        const response = await getInterpretationDraftByVersionApi(versionId);

        return response;
      } catch (error) {
        console.error(
          "Get Interpretation Draft API Error:",
          error.response
        );

        return rejectWithValue(
          error.response?.data || {
            message: "Failed to fetch interpretation draft",
          }
        );
      }
    }
  );

  // ============================================================
// GET INTERPRETATION RULES LIST (ALL VERSIONS)
// ============================================================
// Feeds InterpretationOverview's table.

export const fetchInterpretationRulesByVersion = createAsyncThunk(
  "interpretation/fetchInterpretationRulesByVersion",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInterpretationRulesByVersionApi();

      return response;
    } catch (error) {
      console.error(
        "Get Interpretation Rules By Version API Error:",
        error.response
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch interpretation rules list",
        }
      );
    }
  }
);

  // ============================================================
  // INITIAL STATE
  // ============================================================

  const initialState = {
    // GET
    assessments: [],
    totalAssessments: 0,

    assessmentsLoading: false,
    assessmentsError: null,

    // POST - Interpretation Rules
    interpretationRules: [],
    interpretationRulesLoading: false,
    interpretationRulesSuccess: false,
    interpretationRulesError: null,

    // PUT - Interpretation Rules
  updateInterpretationRulesLoading: false,
  updateInterpretationRulesSuccess: false,
  updateInterpretationRulesError: null,
    

      // GET - Interpretation Draft
    interpretationDraft: null,
    interpretationDraftLoading: false,
    interpretationDraftError: null,

     // GET - Interpretation Rules List
  interpretationList: [],
  totalInterpretations: 0,
  interpretationListLoading: false,
  interpretationListError: null,
  };

  // ============================================================
  // SLICE
  // ============================================================

  const interpretationSlice = createSlice({
    name: "interpretation",

    initialState,

    reducers: {
      resetInterpretationState: (state) => {
        state.assessments = [];
        state.totalAssessments = 0;

        state.assessmentsLoading = false;
        state.assessmentsError = null;

        state.interpretationRules = [];
        state.interpretationRulesLoading = false;
        state.interpretationRulesSuccess = false;
        state.interpretationRulesError = null;
      },

      resetInterpretationRulesState: (state) => {
        state.interpretationRules = [];
        state.interpretationRulesLoading = false;
        state.interpretationRulesSuccess = false;
        state.interpretationRulesError = null;
      },
    },

    extraReducers: (builder) => {
      builder

        // ========================================================
        // GET ASSESSMENTS WITH VERSIONS
        // ========================================================

        .addCase(fetchAssessmentsWithVersions.pending, (state) => {
          state.assessmentsLoading = true;
          state.assessmentsError = null;
        })

        .addCase(fetchAssessmentsWithVersions.fulfilled, (state, action) => {
          state.assessmentsLoading = false;
          state.assessmentsError = null;

          const response = action.payload;

          state.assessments = Array.isArray(response?.data)
            ? response.data
            : [];

          state.totalAssessments = response?.total_assessments || 0;
        })

        .addCase(fetchAssessmentsWithVersions.rejected, (state, action) => {
          state.assessmentsLoading = false;
          state.assessmentsError = action.payload;
        })

        // ========================================================
        // BULK CREATE INTERPRETATION RULES
        // ========================================================

        .addCase(createInterpretationRules.pending, (state) => {
          state.interpretationRulesLoading = true;
          state.interpretationRulesSuccess = false;
          state.interpretationRulesError = null;
        })

        .addCase(createInterpretationRules.fulfilled, (state, action) => {
          state.interpretationRulesLoading = false;
          state.interpretationRulesSuccess = true;
          state.interpretationRulesError = null;

          state.interpretationRules =
            action.payload?.data ?? action.payload ?? [];
        })

        .addCase(createInterpretationRules.rejected, (state, action) => {
          state.interpretationRulesLoading = false;
          state.interpretationRulesSuccess = false;
          state.interpretationRulesError = action.payload;
        })

            // ========================================================
        // BULK UPDATE INTERPRETATION RULES
        // ========================================================

        .addCase(updateInterpretationRules.pending, (state) => { 
          state.updateInterpretationRulesLoading = true;
          state.updateInterpretationRulesSuccess = false; 
          state.updateInterpretationRulesError = null;
        }) 
        .addCase(updateInterpretationRules.fulfilled, (state, action) => { 
          state.updateInterpretationRulesLoading = false; 
          state.updateInterpretationRulesSuccess = true; 
          state.updateInterpretationRulesError = null; 
          state.interpretationRules = action.payload?.data ?? action.payload ?? []; 
        }) 
        .addCase(updateInterpretationRules.rejected, (state, action) => { 
          state.updateInterpretationRulesLoading = false; 
          state.updateInterpretationRulesSuccess = false; 
          state.updateInterpretationRulesError = action.payload; 
        })

        // ========================================================
  // GET INTERPRETATION DRAFT BY VERSION
  // ========================================================

  .addCase(
    fetchInterpretationDraftByVersion.pending,
    (state) => {
      state.interpretationDraftLoading = true;
      state.interpretationDraftError = null;
    }
  )

  .addCase(
    fetchInterpretationDraftByVersion.fulfilled,
    (state, action) => {
      state.interpretationDraftLoading = false;
      state.interpretationDraftError = null;

      state.interpretationDraft = action.payload;
    }
  )

  .addCase(
    fetchInterpretationDraftByVersion.rejected,
    (state, action) => {
      state.interpretationDraftLoading = false;
      state.interpretationDraftError = action.payload;
    }
  )

    // ========================================================
      // GET INTERPRETATION RULES LIST (ALL VERSIONS)
      // ========================================================

      .addCase(fetchInterpretationRulesByVersion.pending, (state) => {
        state.interpretationListLoading = true;
        state.interpretationListError = null;
      })

.addCase(fetchInterpretationRulesByVersion.fulfilled, (state, action) => {
  state.interpretationListLoading = false;
  state.interpretationListError = null;

  const response = action.payload;

  state.interpretationList = Array.isArray(response?.data) ? response.data : [];
  state.totalInterpretations = response?.total_assessments ?? state.interpretationList.length;
})
      .addCase(fetchInterpretationRulesByVersion.rejected, (state, action) => {
        state.interpretationListLoading = false;
        state.interpretationListError = action.payload;
      });
    },
  });

  // ============================================================
  // EXPORT
  // ============================================================

  export const {
    resetInterpretationState,
    resetInterpretationRulesState,
    resetUpdateInterpretationRulesState,
  } = interpretationSlice.actions;

  export default interpretationSlice.reducer;