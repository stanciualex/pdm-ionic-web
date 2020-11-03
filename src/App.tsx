import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import CarList from "./components/CarList";
import CarForm from "./components/CarForm";
import {CarProvider} from "./components/CarProvider";

const App: React.FC = () => (
    <IonApp>
        <CarProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route exact path="/cars" component={CarList} />
                    <Route exact path="/car" component={CarForm} />
                    <Route exact path="/car/:id" component={CarForm} />
                    <Route exact path="/" render={() => <Redirect to="/cars" />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </CarProvider>
    </IonApp>
);

export default App;