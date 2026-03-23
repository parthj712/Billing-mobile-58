import API from "./api";

export const forgetPassword = async (email) => {
    return await API.post("/auth/forget-password", { email });
};

export const verifyForgotOtp = async (email, otp) => {
    return await API.post("/auth/verify-forgot-password-otp", {
        email,
        otp,
    });
};

export const resetPassword = async (email, newPassword) => {
    return await API.post("/auth/reset-password", {
        email,
        newPassword,
    });
};


export const loginCaptain = async (email, password) => {
    const response = await API.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};