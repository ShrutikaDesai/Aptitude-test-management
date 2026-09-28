import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://192.168.1.2:8000/api/v1/",
    // baseURL: "http://10.45.19.38:8000/api/v1/",
    // baseURL: "https://plot-warned-supposed-butterfly.trycloudflare.com/api/v1/",
});

const publicEndpoints = [
    "/auth/login/",
    "/auth/register/",
    "/auth/verify-otp/",
    "/auth/resend-otp/",
    "/auth/forgot-password/",
    "/auth/reset-password/",
    "/auth/refresh/",
];

// ==================== REQUEST INTERCEPTOR ====================

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        const isPublic = publicEndpoints.some((url) =>
            config.url?.includes(url)
        );

        if (token && !isPublic) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================

axiosInstance.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh/")
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${axiosInstance.defaults.baseURL}auth/refresh/`,
                    { refresh: refreshToken }
                );

                // Adjust this destructure to match your actual refresh
                // response shape (see note below the code)
                const { access_token, refresh_token } =
                    response.data.data ?? response.data;

                localStorage.setItem("accessToken", access_token);
                localStorage.setItem("refreshToken", refresh_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = "/";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;