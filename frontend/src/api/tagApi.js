import axiosInstance from "../axiosInstance";

// ================= CREATE TAG =================

export const createTagApi = async (payload) => {
  const response = await axiosInstance.post("/asse/tags/", payload);
  return response.data;
};

// ================= GET TAGS =================

export const getTagsApi = async () => {
  const response = await axiosInstance.get("/asse/tags/");
  return response.data;
};

// ================= UPDATE TAG =================

export const updateTagApi = async (id, payload) => {
  const response = await axiosInstance.put(`/asse/tags/${id}/`, payload);
  return response.data;
};

// ================= DELETE TAG =================

export const deleteTagApi = async (id) => {
  const response = await axiosInstance.delete(`/asse/tags/${id}/`);
  return response.data;
};