import { configureStore } from "@reduxjs/toolkit"
import dogSlice from "./features/dogSlice"

export const store = configureStore({
    reducer: {
        dogReducer: dogSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;