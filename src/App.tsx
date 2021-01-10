import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
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
import {AuthProvider, Login, PrivateRoute} from "./auth";
import {ObjectiveProvider} from "./objective/ObjectiveProvider";
import ObjectiveList from "./objective/ObjectiveList";
import ObjectiveEdit from "./objective/ObjectiveEdit";

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonRouterOutlet>
                <AuthProvider>
                    <Route path="/login" component={Login} exact={true}/>
                    <ObjectiveProvider>
                        <PrivateRoute path="/objectives" component={ObjectiveList} exact={true}/>
                        <PrivateRoute path="/objective" component={ObjectiveEdit} exact={true}/>
                        <PrivateRoute path="/objective/:id" component={ObjectiveEdit} exact={true}/>
                    </ObjectiveProvider>
                    <Route exact path="/" render={() => <Redirect to="/objectives"/>}/>
                </AuthProvider>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
