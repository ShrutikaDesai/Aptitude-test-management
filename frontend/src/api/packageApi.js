import axiosInstance from "../axiosInstance";

// ================= CREATE PACKAGE =================

export const createPackageApi = async (payload) => {
  const response = await axiosInstance.post("/org/packages/", payload);
  return response.data;
};

// ================= GET PACKAGES =================

export const getPackagesApi = async () => {
  const response = await axiosInstance.get("/org/packages-list/");
  return response.data;
};

// ================= UPDATE PACKAGE =================

export const updatePackageApi = async (id, payload) => {
  const response = await axiosInstance.put(`/org/packages/${id}/`, payload);
  return response.data;
};

// ================= DELETE PACKAGE =================

export const deletePackageApi = async (id) => {
  const response = await axiosInstance.delete(`/org/packages/${id}/`);
  return response.data;
};

// ================= GET PACKAGE BY ID =================

export const getPackageByIdApi = async (id) => {
  const response = await axiosInstance.get(`/org/packages/${id}/`);
  return response.data;
};

