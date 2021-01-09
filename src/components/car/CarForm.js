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
    IonItem, IonFabButton, IonIcon, IonThumbnail, IonImg,
} from '@ionic/react';
import {CarContext} from "../../providers/car/CarProvider";
import {useNetwork} from "../../hooks/useNetwork";
import {usePhotoGallery} from "../../hooks/usePhotoGallery";
import {useMyLocation} from "../../hooks/useMyLocations";
import {MyMap} from "../map/MyMap";
import { get } from 'lodash';
import {chainAnimations, groupAnimations, simpleAnimation} from "../animations";

const CarForm = ({ history, match }) => {
    const { cars, loading, requestError, saveCar, deleteCar, offlineMessage } = useContext(CarContext);
    const [car, setCar] = useState(null);
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
    const [fabricationDate, setFabricationDate] = useState('');
    const [horsePower, setHorsePower] = useState(0);
    const [isElectric, setIsElectric] = useState(false);
    const [photo, setPhoto] = useState(null)
    const [coords, setCoords] = useState({ lat: null, lng: null });

    const { networkStatus } = useNetwork();
    const isOnline = networkStatus.connected;
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const myLocation = useMyLocation();

    useEffect(() => {
        const photoBtnElem = document.getElementById('take-photo-btn');
        const manufacturerInputElem = document.getElementById('manufacturer-input');
        const modelInputElem = document.getElementById('model-input');
        const manufacturerLabelElem = document.getElementById('manufacturer-label');
        const modelLabelElem = document.getElementById('model-label');

        simpleAnimation(photoBtnElem);
        groupAnimations(manufacturerInputElem, modelInputElem);
        chainAnimations(manufacturerLabelElem, modelLabelElem);
    }, []);
    
    useEffect(() => {
        const { id } = match.params;

        if (!id) {
            return;
        }

        const currentCar = cars.find(item => item._id === id);

        setCar(currentCar);
        if (currentCar) {
            const { lat, lng } = currentCar;

            setManufacturer(currentCar.manufacturer);
            setModel(currentCar.model);
            setFabricationDate(currentCar.fabricationDate);
            setHorsePower(currentCar.horsePower);
            setIsElectric(currentCar.isElectric);
            setPhoto(currentCar.photo);
            setCoords({ lat, lng });
        }
    }, [match.params.id, cars]);
    
    useEffect(() => {
        if (!coords.lat && !coords.lng) {
            const lat = get(myLocation, 'position.coords.latitude', null);
            const lng = get(myLocation, 'position.coords.longitude', null);

            setCoords({ lat, lng })
        }
    }, [myLocation]);

//     // useEffect(() => {
//     //     (async () => {
//     //         const car1 = {
//     //             manufacturer: 'Audi',
//     //             model: 'A8',
//     //             fabricationDate: '2020-04-14T21:40:53.876+03:00',
//     //             horsePower: 650,
//     //             isElectric: false,
//     //         };
//     //         const car2 = {
//     //             manufacturer: 'BMW',
//     //             model: 'M8',
//     //             fabricationDate: '2015-08-31T21:41:35.473+03:00',
//     //             horsePower: 550,
//     //             isElectric: false,
//     //         };
//     //         const car3 = {
//     //             manufacturer: 'Tesla',
//     //             model: 'Model S',
//     //             fabricationDate: '2021-02-10T21:42:02.501+02:00',
//     //             horsePower: 780,
//     //             isElectric: true,
//     //         };
//     //
//     //         console.log('start saving cars')
//     //         for (let i = 0; i < 300; i++) {
//     //             await saveCar(car1);
//     //             await saveCar(car2);
//     //             await saveCar(car3);
//     //         }
//     //     })();
//     // }, []);
//
    const handleDelete = async () => {
        await deleteCar(car._id, isOnline);
        goBack();
    };

    const handleSave = async () => {
        const inputData = {
            manufacturer,
            model,
            fabricationDate,
            horsePower,
            isElectric,
            photo,
            lat: coords.lat,
            lng: coords.lng,
        };

        if (car) {
            inputData._id = car._id;
        }

        await saveCar(inputData, isOnline);
    };

    const goBack = () => {
        history.push('/cars');
    };

    const handleTakePhoto = async () => {
        const takenPhoto = await takePhoto();
        setPhoto(takenPhoto.src);
    };

    const handleDeletePhoto = async () => {
        const storedPhoto = photos.find(p => p.webviewPath === photo);

        if (storedPhoto) {
            await deletePhoto(storedPhoto);
        }
        setPhoto(null);
    };
    
    const onMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setCoords({ lat, lng });
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
                {offlineMessage && <IonLabel color="primary">{offlineMessage}</IonLabel>}
                <IonItem>
                    <IonLabel id="manufacturer-label">Manufacturer</IonLabel>
                    <IonInput
                        id="manufacturer-input"
                        value={manufacturer}
                        onIonChange={(e) => setManufacturer(e.detail.value)}
                        placeholder="Enter manufacturer..."
                        type="text"
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel id="model-label">Model</IonLabel>
                    <IonInput
                        id="model-input"
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
                <IonButton id="take-photo-btn" style={{ margin: 20 }} onClick={handleTakePhoto}>
                    Take photo
                </IonButton>
                {photo && (
                    <IonButton color="danger" style={{ margin: 20 }} onClick={handleDeletePhoto}>
                        Delete photo
                    </IonButton>
                )}
                <IonItem style={{ margin: 20 }}>
                    {photo ? <IonImg src={photo} style={{ width: 600, height: 'auto' }}/> : <IonLabel>No photo</IonLabel>}
                </IonItem>

                {coords.lat && coords.lng && (
                    <MyMap
                        lat={coords.lat}
                        lng={coords.lng}
                        onMapClick={onMapClick}
                        onMarkerClick={(e) => console.log('marker click', e)}
                    />
                )}
            </IonContent>
        </IonPage>
    );
};

export default CarForm;