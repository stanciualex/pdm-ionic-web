import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';

const Car = ({ text, onEdit }) => {

    return (
        <IonItem onClick={onEdit}>
            <IonLabel>
                {text}
            </IonLabel>
        </IonItem>
    );
};

export default Car;
