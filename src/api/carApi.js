import config from './constants';
import { sendRequest } from "./utils";

const url = `http://${config.baseUrl}/car`;

export const newWebSocket = (token, onMessage) => {
    const ws = new WebSocket(`ws://${config.baseUrl}`);

    ws.onopen = () => {
        console.log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        console.log('web socket onclose');
    };
    ws.onerror = error => {
        console.log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
};

export const getCars = async (token, search, page, limit) => {
    let query = '';
    if (search) {
        query = `?search=${search}`;
    } else if (page && limit) {
        query = `?page=${page}&limit=${limit}`;
    }

    return await sendRequest('get', `${url}${query}`, null, token)
};

export const getCarById = async (id, token) => {
    return await sendRequest('get', `${url}/${id}`, null, token);
};

export const addCar = async (data, token) => {
    return await sendRequest('post', url, data, token);
};

export const updateCarById = async (data, token) => {
    return await sendRequest('put', `${url}/${data._id}`, data, token);
};

export const deleteCarById = async (id, token) => {
    return await sendRequest('delete', `${url}/${id}`, null, token);
};