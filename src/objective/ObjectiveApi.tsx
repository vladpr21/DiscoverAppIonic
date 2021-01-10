import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {ObjectiveProps} from './ObjectiveProps';
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;
const itemUrl = `http://${baseUrl}/api/objective`;


export const getObjectives: (token: string) => Promise<ObjectiveProps[]> = (token) => {
    var result = axios.get(itemUrl, authConfig(token));
    result.then(function (result) {
        result.data.forEach(async (item: ObjectiveProps) => {
            await Storage.set({
                key: item._id!,
                value: JSON.stringify({
                    id: item._id,
                    name: item.name,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    address: item.address,
                    neighborhood: item.neighborhood,
                    city: item.city,
                    userId: item.userId,
                    imgPath: item.imgPath,
                }),
            });
        });
    });


    return withLogs(result, 'getObjectives');

}

export const createObjective: (
    token: string,
    item: ObjectiveProps
) => Promise<ObjectiveProps> = (token, item) => {
    var result = axios.post(itemUrl, item, authConfig(token));
    result.then(async function (r) {
        var item = r.data;
        console.log('res data')
        console.log(r.data)
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                id: item._id,
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                address: item.address,
                neighborhood: item.neighborhood,
                city: item.city,
                userId: item.userId,
                imgPath: item.imgPath,
            }),

        });
    });
    return withLogs(result, 'createObjective');
}

export const updateObjective: (
    token: string,
    item: ObjectiveProps
) => Promise<ObjectiveProps> = (token, item) => {
    var result = axios.put(`${itemUrl}/${item._id}`, item, authConfig(token));
    result.then(async function (r) {
        var item = r.data;
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                id: item._id,
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                address: item.address,
                neighborhood: item.neighborhood,
                city: item.city,
                userId: item.userId,
                imgPath: item.imgPath,
            }),
        });
    });
    return withLogs(result, "updateObjective");
};


export const eraseObjective: (
    token: string,
    item: ObjectiveProps
) => Promise<ObjectiveProps[]> = (token, item) => {
    var result = axios.delete(`${itemUrl}/${item._id}`, authConfig(token));
    console.log('in erase')
    result.then(async function (r) {
        var item = r.data;
        await Storage.remove({
            key: item._id!
        });
    });
    return withLogs(result, "deleteItem");
};


export const getObjective: (token: string, id: string) => Promise<ObjectiveProps> = (token, id) => {
    var result = axios.get(`${itemUrl}/${id}`, authConfig(token))
    return withLogs(result, "getObjective");
}


interface MessageData {
    type: string;
    payload: ObjectiveProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
//
// export const getCitybreaks: (token: string) => Promise<CitybreakProps[]> = token => {
//     return withLogs(axios.get(itemUrl, authConfig(token)), 'getItems');
// }
//
// export const createCitybreak: (token: string, item: CitybreakProps) => Promise<CitybreakProps[]> = (token, item) => {
//     return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
// }
//
// export const updateCitybreak: (token: string, item: CitybreakProps) => Promise<CitybreakProps[]> = (token, item) => {
//     return withLogs(axios.put(`${itemUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
// }
// export const eraseCitybreak: (token: string, item: CitybreakProps) => Promise<CitybreakProps[]> = (token, item) => {
//     return withLogs(axios.delete(`${itemUrl}/${item._id}`,authConfig(token)), 'deleteItem');
// }
//
// interface MessageData {
//     type: string;
//     payload: CitybreakProps;
// }
//
// const log = getLogger('ws');
//
// export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
//     const ws = new WebSocket(`ws://${baseUrl}`);
//     ws.onopen = () => {
//         log('web socket onopen');
//         ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
//     };
//     ws.onclose = () => {
//         log('web socket onclose');
//     };
//     ws.onerror = error => {
//         log('web socket onerror', error);
//     };
//     ws.onmessage = messageEvent => {
//         log('web socket onmessage');
//         onMessage(JSON.parse(messageEvent.data));
//     };
//     return () => {
//         ws.close();
//     }
// }
