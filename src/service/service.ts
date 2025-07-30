import { Alert } from "react-native";
import { AppConstants } from "../utils/constants";
import { DogReqData } from "../models/dogModel";

export const getRandomDogImgApi = async (): Promise<string> => {
    try {
        const url = AppConstants.fetch_dog_img;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
            }
        }

        const response = await fetch(url, options);
        const data = await response.text();

        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch quote');
    }
};

export const postDogDataApi = async (reqData: DogReqData): Promise<string> => {
    try {
        const url = AppConstants.post_dog_data;

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer reqres-free-v1',
                'Content-Type': 'application/json',
                'x-api-key': 'reqres-free-v1'
            },
            body: JSON.stringify(reqData),
        }

        const response = await fetch(url, options);
        const data = await response.text();
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch quote');
    }
};