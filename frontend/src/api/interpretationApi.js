import axiosInstance from "../axiosInstance";

// ================= GET ASSESSMENTS WITH VERSIONS =================

export const getAssessmentsWithVersionsApi = async () => {
  const response = await axiosInstance.get(
    "/asse/assessments-with-versions/"
  );

  return response.data;
};

// ================= CREATE INTERPRETATION RULES =================

export const bulkCreateInterpretationRulesApi = async (payload) => {
  const response = await axiosInstance.post(
    "/asse/interpretation-rules/bulk-create/",
    payload
  );

  return response.data;
};

// ================= UPDATE INTERPRETATION RULES =================
export const bulkUpdateInterpretationRulesApi = async (payload) => {
  const response = await axiosInstance.put( 
    "/asse/interpretation-rules/bulk-update/",
    payload 
  ); 
  
  return response.data; 
};

// ================= GET INTERPRETATION DRAFT BY VERSION =================

export const getInterpretationDraftByVersionApi = async (versionId) => {
  const response = await axiosInstance.get(
    `/asse/interpretation-rules/version/${versionId}/`
  );

  return response.data;
};

// ================= GET INTERPRETATION RULES LIST (ALL VERSIONS) =================

export const getInterpretationRulesByVersionApi = async () => {
  const response = await axiosInstance.get(
    "/asse/interpretation-rules-by-version/"
  );

  return response.data;
}