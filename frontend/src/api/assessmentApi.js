import axiosInstance from "../axiosInstance";

// Create / Publish Assessment
export const publishAssessment = async (payload) => {
  const response = await axiosInstance.post(
    "/asse/assessment-builder/",
    payload
  );

  return response.data;
};

// Update existing draft assessment
export const updateAssessmentDraft = async (id, payload) => {
  const response = await axiosInstance.put(
    `/asse/assessment-builder/blueprint-update/${id}/`,
    payload
  );

  return response.data;
};

// Get Assessment List
export const getAssessmentList = async () => {
  const response = await axiosInstance.get(
    "/asse/assessment-builder-list/"
  );

  return response.data;
};

// Get draft Assessment Detail
export const getAssessmentDetail = async (id) => {
  const response = await axiosInstance.get(
    `/asse/assessment-builder/draft/${id}/`
  );

  return response.data;
};

// Get Assessment Name
export const getAssessments = async () => {
  const response = await axiosInstance.get("/asse/assessments/");

  return response.data;
};

