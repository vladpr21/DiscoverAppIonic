import React, {useContext, useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";
import {Redirect} from "react-router-dom";

import {
    createAnimation,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonToolbar,
} from "@ionic/react";

import {add} from "ionicons/icons";
import Objective from "./Objective";
import {getLogger} from "../core";
import {ObjectiveContext} from "./ObjectiveProvider";
import {AuthContext} from "../auth";
import {ObjectiveProps} from "./ObjectiveProps";
import {useNetwork} from "./useNetwork";
import {MyComponent} from "../animations/MyComponent";

const log = getLogger('ObjectiveList');

const ObjectiveList: React.FC<RouteComponentProps> = ({history}) => {
    useEffect(simpleAnimation, []);

    const {networkStatus} = useNetwork();

    const {objectives, fetching, fetchingError, updateServer} = useContext(ObjectiveContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const [filter, setFilter] = useState<string | undefined>(undefined);

    const [search, setSearch] = useState<string>("");

    const [objectivesShow, setObjectivesShow] = useState<ObjectiveProps[]>([]);

    const city = objectivesShow.map((objective: ObjectiveProps) => objective.city)[0];

    const selectOptions = city === "Cluj-Napoca" ? ["Zorilor", "Manastur", "None"] : ["Centru", "Sector 1", "None"];

    const [position, setPosition] = useState(10);

    const {logout} = useContext(AuthContext);

    const element = document.getElementsByClassName('addButton');
    console.log(element[0])
    element[0]?.addEventListener("onmouseover", function () {
        simpleAnimation()
    });

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };


    useEffect(() => {
        if (networkStatus.connected) {
            updateServer && updateServer();
        }
    }, [networkStatus.connected]);

    useEffect(() => {

        if (objectives?.length) {
            setObjectivesShow(objectives.slice(0, 10));
        }
    }, [objectives]);
    log('render');


    async function searchNext($event: CustomEvent<void>) {
        if (objectives && position < objectives.length) {
            setObjectivesShow([...objectivesShow, ...objectives.slice(position, position + 11)]);
            setPosition(position + 11);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (filter && objectives) {

            let list: ObjectiveProps[] = [];
            objectives.forEach((objective: any) => {

                let verify = false;
                if (objective.neighborhood === filter) verify = true;

                if (verify || filter === "None") {
                    list.push(objective);
                }
            })

            setObjectivesShow(list);

        }
    }, [filter, objectives]);


    useEffect(() => {
        if (objectives) {
            console.log("Search is ", search);
            setObjectivesShow(objectives.filter((objective: any) => {
                if (search !== "") {
                    return objective.name.toLowerCase().startsWith(search)
                } else {
                    return true;
                }
            }).slice(0, 10));
        }
    }, [search, objectives]);

    function simpleAnimation() {
        console.log('in simple')
        const el = document.querySelector('.addButton');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    {offset: 0, opacity: '0.6', transform: 'scale(0.7)'},
                    {offset: 1, opacity: '0.99', transform: 'scale(1)'}
                ])
            animation.play();
        }
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <MyComponent/>
                    <IonButton onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching objectives"/>
                <IonSearchbar
                    value={search}
                    debounce={500}
                    onIonChange={(e) => {
                        if (e.detail.value!.length > 0) {
                            setSearch(e.detail.value!)
                        } else {
                            setSearch("")
                        }
                    }}
                />

                <IonSelect
                    value={filter}
                    placeholder="Neighborhood... "
                    onIonChange={(e) => setFilter(e.detail.value)}
                >
                    {selectOptions.map((option) => (
                        <IonSelectOption key={option} value={option}>
                            {option}
                        </IonSelectOption>
                    ))}
                </IonSelect>

                <div>Network status: {networkStatus.connected ? "online" : "offline"}</div>

                {objectivesShow &&
                objectivesShow.map((objective: ObjectiveProps) => {
                    return (
                        <Objective
                            key={objective._id}
                            _id={objective._id}
                            name={objective.name}
                            address={objective.address}
                            neighborhood={objective.neighborhood}
                            city={objective.city}
                            userId={objective.userId}
                            status={objective.status}
                            version={objective.version}
                            imgPath={objective.imgPath}
                            latitude={objective.latitude}
                            longitude={objective.longitude}
                            onEdit={(id) => history.push(`/objective/${id}`)}
                        />
                    );
                })}
                <IonInfiniteScroll
                    threshold="100px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
                >
                    <IonInfiniteScrollContent loadingText="Loading..."/>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || "Failed to fetch objectives"}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton className="addButton"
                                  onClick={() => history.push("/objective")}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ObjectiveList;
