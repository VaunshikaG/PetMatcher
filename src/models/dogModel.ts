export interface DogReqData {
    name: string;
    breed: string;
    age: string;
    image: { uri: string } | string;
}

export interface ImgResponseData {
    message: string;
    status: string;
}
