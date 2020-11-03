import React, {createContext, useCallback, useEffect, useReducer} from 'react';
import * as types from './types';
import {DELETE_CAR_SUCCEEDED, FETCH_CARS_FAILED, SAVE_CAR_SUCCEEDED} from "./types";
import {addCar, deleteCarById, getCars, newWebSocket, updateCarById} from "../api";

const initialState = {
    cars: [],
    loading: false,
    requestError: null,
};

const updateObject = (object, otherProps) => ({
    ...object,
    ...otherProps,
});

const addOrUpdateCar = (cars, car) => {
    const index = cars.findIndex(item => item.id === car.id);

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
            return updateObject(state, { loading: true, requestError: null });
        case types.FETCH_CARS_SUCCEEDED:
            return updateObject(state, { loading: false, cars: payload.cars });
        case types.FETCH_CARS_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SAVE_CAR_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.SAVE_CAR_SUCCEEDED: {
            const carsClone = [...(state.cars || [])];
            const {car} = payload;
            const newCars = addOrUpdateCar(carsClone, car);

            return updateObject(state, {loading: false, cars: newCars});
        }
        case types.SAVE_CAR_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.DELETE_CAR_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.DELETE_CAR_SUCCEEDED: {
            const carsClone = [...(state.cars || [])];
            const {car} = payload;
            const newCars = carsClone.filter(item => item.id !== car.id);

            return updateObject(state, {loading: false, cars: newCars});
        }
        case types.DELETE_CAR_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
    }
};

export const CarContext = createContext(initialState);

export const CarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, loading, requestError } = state;

    useEffect(() => {
        let canceled = false;
        const fetchCars = async () => {
            try {
                dispatch({type: types.FETCH_CARS_STARTED});
                const fetchedCars = await getCars();

                if (!canceled) {
                    dispatch({ type: types.FETCH_CARS_SUCCEEDED, payload: { cars: fetchedCars } });
                }
            } catch (err) {
                dispatch({ type: FETCH_CARS_FAILED, payload: { error: err.error }});
            }
        };

        fetchCars();
        return () => {
            canceled = true;
        }
    }, []);

    useEffect(() => {
        let canceled = false;

        const closeWebSocket = newWebSocket((message) => {
            if (canceled) {
                return;
            }

            const { action, payload: { car } } = message;

            if ( action === 'create' || action === 'update') {
                dispatch({ type: SAVE_CAR_SUCCEEDED, payload: { car } });
            }
            if (action === 'delete') {
                dispatch({ type: DELETE_CAR_SUCCEEDED, payload: { car } });
            }
        });

        return () => {
            canceled = true;
            closeWebSocket();
        };
    }, []);

    const saveCarCallback = async (car) => {
        const apiMethod = !car.id ? addCar : updateCarById;

        try {
            dispatch({ type: types.SAVE_CAR_STARTED });
            const newCar = await apiMethod(car);

            dispatch({ type: types.SAVE_CAR_SUCCEEDED, payload: { car: newCar } });
        } catch (err) {
            dispatch({ type: types.SAVE_CAR_FAILED, payload: { error: err.error } });
        }
    };

    const deleteCarCallback = async (id) => {
        try {
            dispatch({ type: types.DELETE_CAR_STARTED });
            await deleteCarById(id);

            dispatch({ type: types.DELETE_CAR_SUCCEEDED, payload: { car: { id } } });
        } catch (err) {
            dispatch({ type: types.DELETE_CAR_FAILED, payload: { error: err.error } });
        }
    };

    const saveCar = useCallback(saveCarCallback, []);
    const deleteCar = useCallback(deleteCarCallback, []);
    const value = { cars, loading, requestError, saveCar, deleteCar };

    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );
}