import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMenuItems } from "../../src/services/menuService";


// 🔥 Async thunk
export const fetchMenuItems = createAsyncThunk(
    "menu/fetchMenuItems",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMenuItems();

            // console.log("RTK RAW RESPONSE:", JSON.stringify(res.data, null, 2));

            return res?.data?.menu || res?.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);




const menuSlice = createSlice({
    name: "menu",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuItems.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMenuItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchMenuItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default menuSlice.reducer;