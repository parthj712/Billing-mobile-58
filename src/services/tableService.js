import API from "./api";


export const getTables = async () => {
  const { data } = await API.get("/tables");
  return data;
};


export const updateTableStatus = async (tableId, status) => {
  return await API.patch(`/tables/${tableId}/status`, { status });
};