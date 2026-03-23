import API from "./api";

export const getBills = async () => {
    return await API("/bills");
};

//admin dashboard stat cards
export const getDashboardSummary = async () => {
    return await API("/dashboard/summary");
};

//waiter dashboard recent bills
export const getRecentBills = async () => {
    return await API("/bills/recent-bills");
};
