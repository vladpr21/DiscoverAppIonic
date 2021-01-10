import React, {useEffect, useState} from 'react';
import {createAnimation, IonModal, IonButton, IonContent} from '@ionic/react';

export const MyModal: (props: { open: boolean, url: string, showModal: any }) => JSX.Element = (props: { open: boolean, url: string, showModal: any }) => {
    const [showModal, setShowModal] = useState(props.open);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                {offset: 0, opacity: '0', transform: 'scale(0)'},
                {offset: 1, opacity: '0.99', transform: 'scale(1)'}
            ]);

        const imageAnimation = createAnimation()
            .addElement(baseEl.querySelector('.image')!)
            .keyframes([
                {offset: 0,opacity: '0', transform: 'scale(0)'},
                {offset: 0.5,opacity: '0.5', transform: 'scale(0.4)'},
                {offset: 1,opacity: '0.99', transform: 'scale(1)'}
            ])

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation, imageAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={props.open} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <img className="image" src={props.url} style={{height: 460}} alt="image"/>
                <IonButton onClick={() => props.showModal(false)}>Close</IonButton>
            </IonModal>

        </>
    );
};
