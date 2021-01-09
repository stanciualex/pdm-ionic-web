import React from 'react';
import {IonImg, IonItem, IonLabel, IonThumbnail} from '@ionic/react';

const Car = ({ text, photo, onEdit }) => {
    if (!photo) {
        photo = 'https://thumbs.dreamstime.com/z/no-thumbnail-image-placeholder-forums-blogs-websites-148010362.jpg';
    }

    return (
        <IonItem onClick={onEdit}>
            <IonThumbnail>
                <IonImg src={photo} />
            </IonThumbnail>
            <IonLabel style={{ marginLeft: 8 }}>
                {text}
            </IonLabel>
        </IonItem>
    );
};

export default Car;
