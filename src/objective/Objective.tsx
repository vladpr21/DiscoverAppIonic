import React, {useEffect, useState} from 'react';
import {IonButton, IonItem, IonLabel} from '@ionic/react';
import {ObjectiveProps} from './ObjectiveProps';
import {MyModal} from "../animations/MyModal";
import {randomBytes} from "crypto";

interface ItemPropsExt extends ObjectiveProps {
    onEdit: (_id?: string) => void;
}

const Objective: React.FC<ItemPropsExt> = ({_id, name, neighborhood, imgPath, onEdit}) => {
    const [showModal, setShowModal] = useState(false);
    console.log(_id)
    return (
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>{name} - {neighborhood}</IonLabel>
            <IonButton onClick={() => setShowModal(true)}>Show Picture</IonButton>
            <MyModal open={showModal} url={imgPath} showModal={setShowModal}/>
            <img src={imgPath} style={{ height: 50 , width: 80, marginLeft:10}}  alt="image"/>
        </IonItem>
    );
};

export default Objective;
