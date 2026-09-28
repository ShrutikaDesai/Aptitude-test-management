import axiosInstance from "../axiosInstance";

// ================= REGISTRATION TOKEN =================
// The backend sends students a link like  https://<host>/?token=XXXX
// That token is needed in the register URL, so grab it as soon as the app
// loads (before any redirect drops the query string) and keep it in
// sessionStorage for the Register -> Verify OTP flow.

const REG_TOKEN_KEY = "registrationToken";

const captureRegistrationToken = () => {
  if (typeof window === "undefined") return;
  try {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) sessionStorage.setItem(REG_TOKEN_KEY, token);
  } catch {
    // storage unavailable - ignore
  }
};

captureRegistrationToken();

const getRegistrationToken = () => {
  try {
    return sessionStorage.getItem(REG_TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

const clearRegistrationToken = () => {
  try {
    sessionStorage.removeItem(REG_TOKEN_KEY);
  } catch {
    // ignore
  }
};

// ================= LOGIN =================

export const loginApi = async (payload) => {
  const response = await axiosInstance.post("/auth/students/login/", payload);
  return response.data;
};

// ================= REGISTER =================
// POST /stu/students/register/<token>/
// Called from Verify OTP, after the email OTP has been verified.

export const registerApi = async (payload) => {
  // An explicit `token` in the payload wins, otherwise use the stored one.
  // It's removed from the body since it belongs in the URL.
  const { token: payloadToken, ...body } = payload || {};
  const token = payloadToken || getRegistrationToken();

  if (!token) {
    // Same shape the thunks read (error.response.data)
    return Promise.reject({
      response: {
        data: {
          message:
            "Registration link is invalid or expired. Please open the link you received again.",
        },
      },
    });
  }

  const response = await axiosInstance.post(
    `/stu/students/register/${encodeURIComponent(token)}/`,
    body
  );

  clearRegistrationToken();

  return response.data;
};

// ================= SEND EMAIL OTP =================
// Used for the first OTP on Register and for "Resend code" on Verify OTP.

export const resendOtpApi = async (payload) => {
  const response = await axiosInstance.post(
    "/auth/student/send-email-otp/",
    payload
  );
  return response.data;
};

// ================= VERIFY EMAIL OTP =================

export const verifyOtpApi = async (payload) => {
  const response = await axiosInstance.post(
    "/auth/student/verify-email-otp/",
    payload
  );
  return response.data;
};

// ================= FORGOT PASSWORD =================

export const forgotPasswordApi = async (payload) => {
  const response = await axiosInstance.post("/auth/students/forgot-password/", payload);
  return response.data;
};

// ================= VERIFY RESET OTP =================

export const verifyResetOtpApi = async (payload) => {
  const response = await axiosInstance.post("/auth/students/verify-password-otp/", payload);
  return response.data;
};

// ================= RESET PASSWORD =================

export const resetPasswordApi = async (payload) => {
  const response = await axiosInstance.post("/auth/students/reset-password/", payload);
  return response.data;
};