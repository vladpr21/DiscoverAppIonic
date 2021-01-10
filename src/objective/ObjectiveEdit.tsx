import React, {useContext, useEffect, useState} from 'react';
import {
    createAnimation,
    IonActionSheet,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {ObjectiveContext} from './ObjectiveProvider';
import {RouteComponentProps} from 'react-router';
import {ObjectiveProps} from './ObjectiveProps';
import {AuthContext} from "../auth";
import {useNetwork} from "./useNetwork";
import {Photo, usePhotoGallery} from "./useImageGallery";
import {camera, close, trash} from "ionicons/icons";
import {MapComponent} from "./MapComponent";

const log = getLogger('ObjectiveEdit');

interface ObjectiveEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

export const ObjectiveEdit: React.FC<ObjectiveEditProps> = ({history, match}) => {
    const {objectives, saving, savingError, saveObjective, deleteObjective, getServerObjective, oldObjective} = useContext(ObjectiveContext);
    const {networkStatus} = useNetwork();
    const [itemV2, setItemV2] = useState<ObjectiveProps>();
    const [status, setStatus] = useState(1);
    const [version, setVersion] = useState(-100);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [imgPath, setImgPath] = useState("");
    const [latitude, setLatitude] = useState(46.7533824);
    const [longitude, setLongitude] = useState(23.5831296);
    const [objective, setObjective] = useState<ObjectiveProps>();
    const {_id} = useContext(AuthContext);
    const [userId, setUserId] = useState(_id);

    const {photos, takePhoto, deletePhoto} = usePhotoGallery();
    const [photoDeleted, setPhotoDeleted] = useState<Photo>();

    useEffect(() => {
        setItemV2(oldObjective);
        log("setOldItem: " + JSON.stringify(oldObjective));
    }, [oldObjective]);


    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const objective = objectives?.find((it) => it._id === routeId);
        setObjective(objective);
        if (objective) {
            setName(objective.name);
            setStatus(objective.status);
            setVersion(objective.version);
            setImgPath(objective.imgPath);
            setAddress(objective.address)
            setNeighborhood(objective.neighborhood)
            setCity(objective.city)
            getServerObjective && getServerObjective(match.params.id!, objective?.version);
            if (objective.latitude) setLatitude(objective.latitude);
            if (objective.longitude) setLongitude(objective.longitude);
        }
    }, [match.params.id, objective, getServerObjective]);


    const handleSave = () => {
        console.log('handle save')
        const editedObjective = objective ? {
            ...objective,
            name,
            latitude,
            longitude,
            address,
            neighborhood,
            city,
            userId,
            status: 0,
            version: objective.version ? objective.version + 1 : 1,
            imgPath
        } : {
            name,
            latitude,
            longitude,
            address,
            neighborhood,
            city,
            userId,
            status: 0,
            version: 1,
            imgPath
        };
        saveObjective && saveObjective(editedObjective,
            networkStatus.connected
        ).then(() => {
            console.log('go back')
            if (itemV2 === undefined) history.goBack();
        });
    }


    const handleConflict_keepVersion = () => {
        if (oldObjective) {
            const editedItem = {
                ...objective,
                name,
                latitude,
                longitude,
                address,
                neighborhood,
                city,
                userId,
                status: 0,
                version: oldObjective?.version + 1,
                imgPath
            };
            saveObjective && saveObjective(editedItem, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };


    const handleConflict_updateVersion = () => {
        if (oldObjective) {
            const editedItem = {
                ...objective,
                name: oldObjective?.name,
                latitude: oldObjective.latitude,
                longitude: oldObjective.longitude,
                address: oldObjective.address,
                neighborhood: oldObjective.neighborhood,
                city: oldObjective.city,
                userId: oldObjective.userId,
                status: oldObjective?.status,
                version: oldObjective?.version,
                imgPath: oldObjective?.imgPath
            };
            saveObjective && editedItem && saveObjective(editedItem, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };

    useEffect(() => {
        async function groupedAnimation() {
            const saveButtonAnimation = createAnimation()
                .addElement(document.getElementsByClassName("saveButton")[0])
                .duration(3000)
                .direction('alternate')
                .iterations(1)
                .keyframes([
                    {offset: 0, opacity: '0.6', transform: 'scale(0.7)'},
                    {offset: 0.5, opacity: '0.7', transform: 'scale(0.8)'},
                    {offset: 1, opacity: '0.99', transform: 'scale(1)'}
                ])

            const deleteButtonAnimation = createAnimation()
                .addElement(document.getElementsByClassName("deleteButton")[0])
                .duration(3000)
                .direction('alternate')
                .iterations(1)
                .keyframes([
                    {offset: 0, opacity: '0.6', transform: 'scale(0.7)'},
                    {offset: 0.5, opacity: '0.7', transform: 'scale(0.8)'},
                    {offset: 1, opacity: '0.99', transform: 'scale(1)'}
                ])

            const titleAnimation = createAnimation()
                .addElement(document.getElementsByClassName("title")[0])
                .duration(3000)
                .direction('alternate')
                .iterations(1)
                .keyframes([
                    {offset: 0, opacity: '0.2', transform: 'scale(1)'},
                    {offset: 0.5, opacity: '0.5', transform: 'scale(1)'},
                    {offset: 1, opacity: '0.99', transform: 'scale(1)'}
                ])

            const animations = createAnimation()
                .duration(1000)
                .iterations(1)
                .direction('alternate')
                .addAnimation([saveButtonAnimation, deleteButtonAnimation, titleAnimation])


            animations.play();
        }

        groupedAnimation();
    }, [])

    useEffect(() => {
        async function chainedAnimations() {

            const nameAnimation = createAnimation()
                .addElement(document.getElementsByClassName("name")[0])
                .fill('none')
                .duration(1000)
                .iterations(1)
                .fromTo('transform', 'translateX(300px)', 'translateX(0px)')


            const addressAnimation = createAnimation()
                .addElement(document.getElementsByClassName("address")[0])
                .fill('none')
                .duration(1000)
                .iterations(1)
                .fromTo('transform', 'translateX(300px)', 'translateX(0px)')


            const neighborhoodAnimation = createAnimation()
                .addElement(document.getElementsByClassName("neighborhood")[0])
                .fill('none')
                .duration(1000)
                .iterations(1)
                .fromTo('transform', 'translateX(300px)', 'translateX(0px)')

            const cityAnimation = createAnimation()
                .addElement(document.getElementsByClassName("city")[0])
                .fill('none')
                .duration(1000)
                .iterations(1)
                .fromTo('transform', 'translateX(300px)', 'translateX(0px)')

            await nameAnimation.play();
            await addressAnimation.play();
            await neighborhoodAnimation.play();
            await cityAnimation.play();
        }

        chainedAnimations();
    }, []);


    const handleDelete = () => {
        const deletedObjective = objective
            ? {
                ...objective,
                name,
                latitude,
                longitude,
                address,
                neighborhood,
                city,
                userId,
                status: 0,
                version: 0,
                imgPath
            }
            : {
                name,
                latitude,
                longitude,
                address,
                neighborhood,
                city,
                userId,
                status: 0,
                version: 0,
                imgPath
            };
        deleteObjective && deleteObjective(deletedObjective, networkStatus.connected).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className="title">Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton className="saveButton" onClick={handleSave}>Save</IonButton>
                        <IonButton className="deleteButton" onClick={handleDelete}>Delete</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Objective name: </IonLabel>
                    <IonInput className="name"
                              value={name}
                              placeholder="Name of objective"
                              onIonChange={(e) => setName(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Address: </IonLabel>
                    <IonInput className="address"
                              value={address}
                              placeholder="Street, nr"
                              onIonChange={(e) => setAddress(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Neighborhood: </IonLabel>
                    <IonInput className="neighborhood"
                              value={neighborhood}
                              placeholder="Neighborhood of objective"
                              onIonChange={(e) => setNeighborhood(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>City: </IonLabel>
                    <IonInput className="city"
                              value={city}
                              placeholder="Will be completed with user city"
                              readonly={true}
                    />
                </IonItem>

                <img src={objective?.imgPath === imgPath ? objective?.imgPath : imgPath} alt=""/>
                <MapComponent
                    lat={latitude}
                    lng={longitude}
                    onMapClick={(location: any) => {
                        setLatitude(location.latLng.lat());
                        setLongitude(location.latLng.lng());
                    }}
                />

                {itemV2 && (
                    <>
                        <IonItem>
                            <IonLabel>Name: {itemV2.name}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Address: {itemV2.address}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Neighborhood: {itemV2.neighborhood}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>City: {itemV2.city}</IonLabel>
                        </IonItem>

                        <IonButton className="deleteButton" onClick={handleConflict_keepVersion}>Keep your
                            version</IonButton>
                        <IonButton className="saveButton" onClick={handleConflict_updateVersion}>Update to new
                            version</IonButton>
                    </>
                )}


                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || "Failed to save objective"}</div>
                )}
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton
                        onClick={() => {
                            const photoTaken = takePhoto();
                            photoTaken.then((data) => {
                                setImgPath(data.webviewPath!);
                            });
                        }}
                    >
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet
                    isOpen={!!photoDeleted}
                    buttons={[
                        {
                            text: "Delete",
                            role: "destructive",
                            icon: trash,
                            handler: () => {
                                if (photoDeleted) {
                                    deletePhoto(photoDeleted);
                                    setPhotoDeleted(undefined);
                                }
                            },
                        },
                        {
                            text: "Cancel",
                            icon: close,
                            role: "cancel",
                        },
                    ]}
                    onDidDismiss={() => setPhotoDeleted(undefined)}
                />
            </IonContent>
        </IonPage>
    );
};
export default ObjectiveEdit;
