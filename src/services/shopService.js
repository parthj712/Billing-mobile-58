import API from "./api";

export const getShopName = async () => {
    return await API.get("/shops/shop-name");
};

export const adminInfo = async () => {
    return await API.get("/staff/admin");
};

export const getShopInfo = async () => {
    return await API.get("/shops/shop-info");
};

export const addWebsite = async (payload) => {
    return await API.put("/shops/update-website", payload);
};

export const addTagline = async (payload) => {
    return await API.put("/shops/tagline", payload);
};
export const uploadShopLogo = async (file) => {
    const formData = new FormData();
    formData.append("logo", file);

    return await API.post("/shops/upload-logo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const uploadShopQR = async (file) => {
    const formData = new FormData();
    formData.append("qr", file);

    return await API.post("/shops/upload-qr", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
export const removeShopLogo = async () => {
    return await API.delete("/shops/logo");
};

export const removeShopQR = async () => {
    return await API.delete("/shops/qr");
};

export const addOrUpdateGST = async (payload) => {
    return await API.post("/shops/gst-number", payload);
};

export const getFeedbackLink = async () => {
    return API.get("/shops/feedback-link");
};