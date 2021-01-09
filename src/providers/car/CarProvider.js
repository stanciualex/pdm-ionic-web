import React, {createContext, useCallback, useContext, useEffect, useReducer} from 'react';
import * as types from './carTypes';
import {addCar, deleteCarById, getCars, newWebSocket, updateCarById} from "../../api/carApi";
import { updateObject } from "../utils";
import {AuthContext} from "../auth/AuthProvider";
import storageService from "../../utils/StorageService";
import {useNetwork} from "../../hooks/useNetwork";

const CARS_LIMIT = 25;

const initialState = {
    cars: [],
    loading: false,
    requestError: null,
    page: 1,
    totalPages: 1,
    search: '',
};

const addOrUpdateCar = (cars, car) => {
    const index = cars.findIndex(item => item._id === car._id);

    if (index === -1) {
        cars.push(car);
    } else {
        cars[index] = car;
    }

    return cars;
};

const reducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case types.FETCH_CARS_STARTED:
            return updateObject(state, { loading: true, requestError: null, offlineMessage: null });
        case types.FETCH_CARS_SUCCEEDED:
            const newCars = payload.page === 1 ? [...payload.cars] : [...state.cars, ...payload.cars];
            return updateObject(state, { loading: false, cars: newCars, page: payload.page, totalPages: payload.totalPages });
        case types.FETCH_CARS_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SAVE_CAR_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.SAVE_CAR_SUCCEEDED: {
            const carsClone = [...(state.cars || [])];
            const {car, offlineMessage} = payload;
            const newCars = addOrUpdateCar(carsClone, car);

            return updateObject(state, {loading: false, cars: newCars, offlineMessage });
        }
        case types.SAVE_CAR_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.DELETE_CAR_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.DELETE_CAR_SUCCEEDED: {
            const carsClone = [...(state.cars || [])];
            const {car, offlineMessage} = payload;
            const newCars = carsClone.filter(item => item._id !== car._id);

            return updateObject(state, {loading: false, cars: newCars, offlineMessage});
        }
        case types.DELETE_CAR_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SET_PAGE:
            return updateObject(state, { page: payload.page });
        case types.SET_SEARCH:
            return updateObject(state, { search: payload.search });
        default:
            return { ...state };
    }
};

export const CarContext = createContext(initialState);

export const CarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, loading, requestError, page, totalPages, search, offlineMessage } = state;
    const { token } = useContext(AuthContext);
    const { networkStatus } = useNetwork();

    useEffect(() => {
        let canceled = false;
        const fetchCars = async () => {
            console.log('networkStatus.connected', networkStatus.connected);
            if (networkStatus.connected) {
                try {
                    if (search && page > 1) {
                        dispatch({ type: types.SET_PAGE, payload: { page: 1 } });
                    }
                    dispatch({type: types.FETCH_CARS_STARTED});
                    const fetchResponse = await getCars(token, search, page, CARS_LIMIT);
                    console.log('fetchResponse', fetchResponse);

                    if (!canceled) {
                        dispatch({ type: types.FETCH_CARS_SUCCEEDED, payload: { cars: fetchResponse.items, page, totalPages: fetchResponse.totalPages } });
                    }
                } catch (err) {
                    dispatch({ type: types.FETCH_CARS_FAILED, payload: { error: err.message }});
                }
            } else {
                const searchValue = search.toLowerCase();
                const filteredCars = cars.filter(car => {
                    const carDescription = `${car.manufacturer} ${car.model}`.toLowerCase();

                    return carDescription.includes(searchValue);
                });
                if (!canceled) {
                    dispatch({ type: types.FETCH_CARS_SUCCEEDED, payload: { cars: filteredCars, page: 1, totalPages: 1 } });
                }
            }
        };

        fetchCars();
        return () => {
            canceled = true;
        }
    }, [token, page, search, networkStatus.connected]);

    useEffect(() => {
        let canceled = false;

        const closeWebSocket = newWebSocket(token, (message) => {
            if (canceled) {
                return;
            }

            const { action, payload: { car } } = message;

            if ( action === 'create' || action === 'update') {
                dispatch({ type: types.SAVE_CAR_SUCCEEDED, payload: { car } });
            }
            if (action === 'delete') {
                dispatch({ type: types.DELETE_CAR_SUCCEEDED, payload: { car } });
            }
        });

        return () => {
            canceled = true;
            closeWebSocket();
        };
    }, [token]);

    useEffect(() => {
        if (networkStatus.connected) {
            storageService.sync(saveCar, deleteCar);
        }
    }, [networkStatus.connected]);

    const saveCarCallback = async (car, isOnline, sync = false) => {
        if (isOnline) {
            const apiMethod = !car._id ? addCar : updateCarById;

            try {
                dispatch({ type: types.SAVE_CAR_STARTED });
                const newCar = await apiMethod(car, token);

                if (!sync) {
                    dispatch({ type: types.SAVE_CAR_SUCCEEDED, payload: { car: newCar } });
                }
            } catch (err) {
                dispatch({ type: types.SAVE_CAR_FAILED, payload: { error: err.message } });
            }
        } else {
            const newCar = await storageService.saveCar(car);
            const verb = car._id ? 'updated' : 'added';
            const offlineMessage = `[OFFLINE] Car ${verb} without syncing with server.`;
            dispatch({ type: types.SAVE_CAR_SUCCEEDED, payload: { car: newCar, offlineMessage } });
        }
    };

    const deleteCarCallback = async (id, isOnline, sync = false) => {
        if (isOnline) {
            try {
                dispatch({ type: types.DELETE_CAR_STARTED });
                await deleteCarById(id, token);

                if (!sync) {
                    dispatch({ type: types.DELETE_CAR_SUCCEEDED, payload: { car: { _id: id } } });
                }
            } catch (err) {
                dispatch({ type: types.DELETE_CAR_FAILED, payload: { error: err.message } });
            }
        } else {
            await storageService.deleteCar(id);
            const offlineMessage = '[OFFLINE] Car deleted without syncing with server.';
            dispatch({ type: types.DELETE_CAR_SUCCEEDED, payload: { car: { _id: id }, offlineMessage } });
        }
    };

    const loadMoreCallback = () => {
        console.log('page', page);
        console.log('totalPages', totalPages);
        if (page < totalPages) {
            dispatch({ type: types.SET_PAGE, payload: { page: page + 1 } });
        }
    };
    
    const onSearchChangeCallback = (value) => {
        dispatch({ type: types.SET_SEARCH, payload: { search: value } });
    };

    const saveCar = useCallback(saveCarCallback, [token]);
    const deleteCar = useCallback(deleteCarCallback, [token]);
    const loadMore = useCallback(loadMoreCallback, [token, page, totalPages]);
    const onSearchChange = useCallback(onSearchChangeCallback, []);
    const value = { cars, loading, requestError, saveCar, deleteCar, page, totalPages, loadMore, search, onSearchChange, offlineMessage };

    console.log('search', state);
    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );
}