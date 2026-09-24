import axiosInstance from "../axiosInstance";

// ================= CREATE ORGANIZATION (STEP 1) =================

export const createOrganizationApi = async (payload) => {
  const response = await axiosInstance.post(
    "/org/organizations/create/",
    payload
  );

  return response.data;
};

// ================= UPDATE ORGANIZATION ) =================

export const updateOrganizationApi = async (id, payload) => {
  const response = await axiosInstance.put(
    `/org/organizations/${id}/update/`,
    payload
  );

  return response.data;
};

// ================= FETCH ORGANIZATION DRAFT =================

export const fetchOrganizationDraftApi = async (id) => {
  const response = await axiosInstance.get(
    `/org/organizations/${id}/draft/`
  );

  return response.data;
};

// ================= FETCH ORGANIZATIONS LIST =================
export const fetchOrganizationsListApi = async (params = {}) => {
  const response = await axiosInstance.get("/org/organizations/list/", {
    params,
  });

  return response.data;
};