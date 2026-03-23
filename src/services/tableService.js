import API from "./api";


export const getTables = async () => {
  const { data } = await API.get("/tables");
  return data;
};