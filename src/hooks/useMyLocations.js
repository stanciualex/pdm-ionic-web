import { useEffect, useState } from 'react';
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

export const useMyLocation = () => {
    const [state, setState] = useState({});
    useEffect(watchMyLocation, []);
    return state;

    function watchMyLocation() {
        let cancelled = false;
        Geolocation.getCurrentPosition()
            .then(position => updateMyPosition('current', position))
            .catch(error => updateMyPosition('current',undefined, error));
        const callbackId = Geolocation.watchPosition({}, (position, error) => {
            updateMyPosition('watch', position, error);
        });
        return () => {
            cancelled = true;
            Geolocation.clearWatch({ id: callbackId });
        };

        function updateMyPosition(source, position, error) {
            console.log(source, position, error);
            if (!cancelled) {
                setState({ ...state, position: position || state.position, error });
            }
        }
    }
};
