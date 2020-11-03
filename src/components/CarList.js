import React, {useContext, useEffect, useState} from 'react';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Car from "./Car";
import {CarContext} from "./CarProvider";

const ItemList = ({ history }) => {
    const { cars, loading, requestError } = useContext(CarContext);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Nice Cars App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={loading} message="Fetching cars" />
                {cars && (
                    <IonList>
                        {cars.map(({ id, manufacturer, model }) =>
                            <Car
                                key={`car-list-item-${id}`}
                                text={`${manufacturer} ${model}`}
                                onEdit={() => history.push(`/car/${id}`)}
                            />
                        )}
                    </IonList>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/car')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
            {requestError && <IonLabel color={"danger"}>{requestError}</IonLabel>}
        </IonPage>
    );
};

export default ItemList;
