const { default: API } = require("./api");

export const finalizeBillAndOrder = async (payload) => {
    return await API.post("/bills/finalize", payload);
};

export const getOrders = async () => {
    return await API.get("/orders");
};

export const saveOrdersToDraft = async (payload) => {
    return await API.post("/orders/draft", payload);
};

export const fetchActiveOrder = async (tableId) => {
    return await API.get(`/orders/active?tableId=${tableId}`);
};

export const addTakeawayOrder = async (payload) => {
    return await API.post("/orders/takeaway", payload);
};

export const fetchActiveTakaway = async () => {
    return await API.get("/orders/takeaway-active");
};
export const fetchActiveTakawayById = async (orderId) => {
    return await API.get(`/orders/takeaway-active/${orderId}`);
};

export const itemIncrement = async (data) => {
    await API.post("/orders/increase", data);
};
export const itemDecrement = async (data) => {
    await API.post("/orders/decrease", data);
};

export const getCustomerInfo = async (data) => {
    await API.post("/orders/takeaway-customers", data);
};
export const printKot = (tableId) => API.post("/orders/kot/print", { tableId });

// export const addQuickOrder = async (data) => {
//   await API.post("/ordres/quick-add", data);
// };

// export const fetchQuickOrders = async () => {
//   await API.get("/orders/quick-active");
// };
