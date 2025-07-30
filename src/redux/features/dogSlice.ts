import { createSlice } from "@reduxjs/toolkit";
import { DogReqData } from "../models/dogModel";
import { getRandomDogImgThunk, postDogDataThunk } from "./dogThunk";

interface DogState {
    // data: DogReqData | null;
    isLoading: boolean;
    img: string | null;
    status: string | null;
    error: string | null;
}
const initialState: DogState = {
    // data: null,
    isLoading: false,
    img: null,
    status: null,
    error: null
}

const dogSlice = createSlice({
    name: 'dog',
    initialState: initialState,
    reducers: {
        clearAll: (state) => {
            state.error = null;
            state.status = null;
            state.img = null;
        },
        fetchImg: (state, action) => { },
        sendDogData: (state, action) => { },
    },
    extraReducers(builder) {
        builder
            .addCase(getRandomDogImgThunk.pending, (state) => {
                state.isLoading = true
                state.error = null;
            })
            .addCase(getRandomDogImgThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.img = action.payload.message;
                state.status = action.payload.status;
                state.error = null;
            })
            .addCase(getRandomDogImgThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || (action.error.message as string);
                state.status = "failed";
            })

            .addCase(postDogDataThunk.pending, (state) => {
                state.isLoading = true;
                state.status = "loading";
                state.error = null;
                state.img = null;
            })
            .addCase(postDogDataThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.status = action.payload || 'succeeded';
                state.error = null;
                state.img = null;
            })
            .addCase(postDogDataThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || (action.error.message as string);
                state.status = "failed";
            })
    }
});

export const { clearAll } = dogSlice.actions;
export default dogSlice.reducer;