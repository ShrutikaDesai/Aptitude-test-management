import axiosInstance from "../axiosInstance";

// Get Report Templates
export const getReportTemplates = async () => {
  const response = await axiosInstance.get("/report/report-templates/");

  return response.data;
};