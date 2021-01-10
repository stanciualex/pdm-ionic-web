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
    IonButtons,
    IonButton,
    IonInput,
    IonInfiniteScroll,
    IonInfiniteScrollContent, IonGrid, IonRow, IonCol, IonCheckbox, IonItem, IonDatetime, IonSelect, IonSelectOption,
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Car from "./Car";
import {CarContext} from "../../providers/car/CarProvider";
import { throttle, debounce } from 'lodash';

const DEFAULT_FILTERS = {
    hasStartDate: false,
    startDate: null,
    hasEndDate: false,
    endDate: null,
    type: 'all',
};

const ItemList = ({ history }) => {
    const { cars, loading, requestError, loadMore, page, totalPages, search, onSearchChange } = useContext(CarContext);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const onChange = debounce((event) => {
        onSearchChange(event.detail.value, filters);
    }, 500);
    
    const onScroll = (event) => {
        loadMore();
        event.target.complete();
    };

    const setHasDate = (e, prop) => {
        setFilters({
            ...filters,
            [prop]: e.detail.checked,
        })
    }

    const setDate = (e, prop) => {
        setFilters({
            ...filters,
            [prop]: e.detail.value,
        })
    }
    
    const setType = (e) => {
        setFilters({
            ...filters,
            type: e.detail.value,
        })
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
                                <IonCheckbox checked={filters.hasStartDate} onIonChange={(e) => setHasDate(e, 'hasStartDate')} />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            <IonItem>
                                <IonDatetime
                                    value={filters.startDate}
                                    onIonChange={(e) => setDate(e, 'startDate')}
                                    placeholder="Select start date"
                                    type="date"
                                    disabled={!filters.hasStartDate}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel>End date</IonLabel>
                                <IonCheckbox checked={filters.hasEndDate} onIonChange={(e) => setHasDate(e, 'hasEndDate')} />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            <IonItem>
                                <IonDatetime
                                    value={filters.endDate}
                                    onIonChange={(e) => setDate(e, 'endDate')}
                                    placeholder="Select end date"
                                    type="date"
                                    disabled={!filters.hasEndDate}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonSelect value={filters.type} okText="Okay" cancelText="Dismiss" onIonChange={setType}>
                                <IonSelectOption value="all">All cars</IonSelectOption>
                                <IonSelectOption value="electric">Electric cars</IonSelectOption>
                                <IonSelectOption value="nonElectric">Non electric cars</IonSelectOption>
                            </IonSelect>
                        </IonCol>
                        <IonCol>
                            <IonButton onClick={() => onSearchChange(search, filters)}>
                                Filter
                            </IonButton>
                            <IonButton color="danger" style={{ marginLeft: 20 }} onClick={() => {
                                setFilters(DEFAULT_FILTERS);
                                onSearchChange(search, null);
                            }}>
                                Reset filters
                            </IonButton>
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
