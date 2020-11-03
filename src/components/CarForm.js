import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonDatetime,
    IonCheckbox,
    IonLabel,
    IonItem,
} from '@ionic/react';
import {CarContext} from "./CarProvider";

const CarForm = ({ history, match }) => {
    const { cars, loading, requestError, saveCar, deleteCar } = useContext(CarContext);
    const [car, setCar] = useState(null);
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
    const [fabricationDate, setFabricationDate] = useState('');
    const [horsePower, setHorsePower] = useState(0);
    const [isElectric, setIsElectric] = useState(false);

    useEffect(() => {
        if (!match.params.id) {
            return;
        }

        const carId = parseInt(match.params.id);
        const currentCar = cars.find(item => item.id === carId);

        setCar(currentCar);
        if (currentCar) {
            setManufacturer(currentCar.manufacturer);
            setModel(currentCar.model);
            setFabricationDate(currentCar.fabricationDate);
            setHorsePower(currentCar.horsePower);
            setIsElectric(currentCar.isElectric);
        }
    }, [match.params.id, cars]);

    const handleDelete = async () => {
        await deleteCar(car.id);
        goBack();
    };

    const handleSave = async () => {
        const inputData = {
            manufacturer,
            model,
            fabricationDate,
            horsePower,
            isElectric,
        };

        if (car) {
            inputData.id = car.id;
        }

        await saveCar(inputData);
    };

    const goBack = () => {
        history.push('/cars');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={goBack}>
                            Back
                        </IonButton>
                    </IonButtons>
                    <IonTitle>{car ? 'Edit Car' : 'Add New Car'}</IonTitle>
                    <IonButtons slot="end">
                        {car && (
                            <IonButton color="danger" onClick={handleDelete}>
                                Delete
                            </IonButton>
                        )}
                        <IonButton color="primary" onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={loading} />
                {requestError && <IonLabel color="danger">{requestError}</IonLabel>}
                <IonItem>
                    <IonLabel>Manufacturer</IonLabel>
                    <IonInput
                        value={manufacturer}
                        onIonChange={(e) => setManufacturer(e.detail.value)}
                        placeholder="Enter manufacturer..."
                        type="text"
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Model</IonLabel>
                    <IonInput
                        value={model}
                        onIonChange={(e) => setModel(e.detail.value)}
                        placeholder="Enter model..."
                        type="text"
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Fabrication date</IonLabel>
                    <IonDatetime
                        value={fabricationDate}
                        onIonChange={(e) => setFabricationDate(e.detail.value)}
                        placeholder="Enter fabrication date..."
                        type="date"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Horse power</IonLabel>
                    <IonInput
                        value={horsePower}
                        onIonChange={(e) => setHorsePower(e.detail.value)}
                        placeholder="Enter horse power..."
                        type="number"
                        min={0}
                        max={1000}
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Is Electric</IonLabel>
                    <IonCheckbox
                        checked={isElectric}
                        onIonChange={(e) => setIsElectric(e.detail.checked)}
                    />
                </IonItem>
            </IonContent>
        </IonPage>
    );
};

export default CarForm;