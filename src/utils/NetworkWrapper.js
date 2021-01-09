import React, {useEffect, useState} from 'react';
import { IonContent, IonToast } from "@ionic/react";
import { useNetwork } from "../hooks/useNetwork";
import storageService from "./StorageService";

const NetworkWrapper = ({ children }) => {
    const { networkStatus } = useNetwork();
    const isOnline = networkStatus.connected;

    return (
        <IonContent>
            <IonToast
                isOpen={!isOnline}
                message="Oops, it seems you have connection issues!"
                position="top"
                color="danger"
            />
            {children}
        </IonContent>
    );
};

export default NetworkWrapper;