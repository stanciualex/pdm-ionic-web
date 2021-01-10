import { Plugins } from "@capacitor/core";
import { nanoid } from 'nanoid';
import {save} from "ionicons/icons";
const { Storage } = Plugins;

export const storageKeys = {
    ADDED_CARS: 'added-cars',
    DELETED_CARS: 'deleted-cars',
};

class StorageService {
    async setItem(key, data) {
        await Storage.set({
            key,
            value: JSON.stringify(data)
        });
    }

    async getItem(key) {
        const { value } = await Storage.get({ key });
        return JSON.parse(value);
    }

    async removeItem(key) {
        await Storage.remove({ key });
    }

    async getKeys() {
        const { keys } = await Storage.keys();
        return keys;
    }

    async clear() {
        await Storage.clear();
    }

    async addCar(car) {
        const cars = await this.getItem(storageKeys.ADDED_CARS) || [];

        if (!car._id) {
            car._id = nanoid();
            car.localOnly = true;
        }

        cars.push(car);
        await this.setItem(storageKeys.ADDED_CARS, cars);
        return car;
    }

    async saveCar(car) {
        const cars = await this.getItem(storageKeys.ADDED_CARS);
        console.log('[StorageService] Added cars: ', cars, '  New car:', car);
        return await this.addCar(car);
    }

    async deleteCar(id) {
        const cars = await this.getItem(storageKeys.ADDED_CARS);
        const index = cars.findIndex(c => c._id === id);
        console.log('[StorageService] Delete car id:', id);

        if (index < 0) {
            const deletedCars = await this.getItem(storageKeys.DELETED_CARS) || [];
            deletedCars.push({ _id: id });
            await this.setItem(storageKeys.DELETED_CARS, deletedCars);
        } else {
            cars.splice(index, 1);
            await this.setItem(storageKeys.ADDED_CARS, cars);
        }
    }

    async sync(saveFunc, deleteFunc) {
        const carsToSync = await this.getItem(storageKeys.ADDED_CARS) || [];
        console.log('[SYNC] Cars to add:', carsToSync);
        await Promise.all(carsToSync.map(car => {
            if (car.localOnly) {
                delete car._id;
                delete car.localOnly;
            }

            saveFunc(car, true, true);
        }));
        await this.removeItem(storageKeys.ADDED_CARS);

        const carsToDelete = await this.getItem(storageKeys.DELETED_CARS) || [];
        console.log('[SYNC] Cars to delete', carsToDelete);
        await Promise.all(carsToDelete.map(car => {
            deleteFunc(car._id, true, true);
        }));
        await this.removeItem(storageKeys.DELETED_CARS);
    }
}

const storageService = new StorageService();

export default storageService;