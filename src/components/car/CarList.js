import React, {useContext, useEffect} from 'react';
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
    IonButtons,
    IonButton,
    IonInput,
    IonInfiniteScroll,
    IonInfiniteScrollContent, IonGrid, IonRow, IonCol, IonCheckbox, IonItem,
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Car from "./Car";
import {CarContext} from "../../providers/car/CarProvider";

const ItemList = ({ history }) => {
    const { cars, loading, requestError, loadMore, page, totalPages, search, onSearchChange } = useContext(CarContext);

    const onChange = (event) => {
        onSearchChange(event.detail.value);
    };
    
    const onScroll = (event) => {
        loadMore();
        event.target.complete();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Nice Cars App</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/logout')}>
                            Logout
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={loading} message="Fetching cars" />
                <IonInput
                    placeholder="Search..."
                    value={search}
                    onIonChange={onChange}
                />

                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel>Start date</IonLabel>
                                <IonCheckbox checked={false}  />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            123
                        </IonCol>
                        <IonCol>
                            asd
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {cars && (
                    <>
                        <IonList>
                            {cars.map(({ _id, manufacturer, model, photo }) =>
                                <Car
                                    key={`car-list-item-${_id}`}
                                    text={`${manufacturer} ${model}`}
                                    photo={photo}
                                    onEdit={() => history.push(`/car/${_id}`)}
                                />
                            )}
                        </IonList>
                    </>
                )}
                <IonInfiniteScroll
                    onIonInfinite={onScroll}
                    threshold={"20px"}
                    disabled={page === totalPages}
                >
                    <IonInfiniteScrollContent
                        loadingSpinner="circles"
                        loadingText="Loading..."
                    />
                </IonInfiniteScroll>
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
