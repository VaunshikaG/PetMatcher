import { createAsyncThunk } from "@reduxjs/toolkit"
import { DogReqData, ImgResponseData } from "../../models/dogModel";
import { postDogDataApi, getRandomDogImgApi } from "../../service/service";

export const postDogDataThunk = createAsyncThunk(
    'api/postDogDataThunk',
    async(reqData: DogReqData, {rejectWithValue}) => {
        try {
            const data = await postDogDataApi(reqData);
            const parse_data = JSON.parse(data);
            if(!parse_data) {
                return rejectWithValue('failed to parse data')
            }
            return parse_data;
            
        } catch (error: any) {
            return rejectWithValue(error.message || 'failed to parse');
        }
    }
);

export const getRandomDogImgThunk = createAsyncThunk(
    'api/getRandomDogImgThunk',
    async(_, {rejectWithValue}) => {
        try {
            const data = await getRandomDogImgApi();
            const parse_data: ImgResponseData = JSON.parse(data);

            if(!parse_data) {
                return rejectWithValue('failed to parse data')
            }
            return parse_data;

        } catch (error: any) {
            return rejectWithValue(error.message || 'failed to parse');
        }
    }
)