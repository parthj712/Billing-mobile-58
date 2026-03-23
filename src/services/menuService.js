import API from "./api";

export const getMenuItems = async () => {
    const res = await API.get("/menu");

    // 🔥 Always return array
    return res
};



export const addMenuItem = async (payload) => {
    const { data } = await API.post("/menu", payload);
    return data;
};



export const getCatgories = async () => {
  return await API.get("/menu/categories");
};
