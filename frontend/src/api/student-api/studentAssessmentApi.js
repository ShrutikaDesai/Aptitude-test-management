import axiosInstance from "../../axiosInstance";

// ================= ASSESSMENT QUESTIONS =================
// GET /stu/student/registrations/<registrationId>/assessment-questions/

export const getAssessmentQuestionsApi = async (registrationId) => {
  const response = await axiosInstance.get(
    `/stu/student/registrations/${encodeURIComponent(registrationId)}/assessment-questions/`
  );
  return response.data;
};