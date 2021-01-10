import {useEffect, useState} from 'react';
import {AppState, Plugins} from "@capacitor/core";

const {App} = Plugins;

const initialState = {
    isActive: true,
}

export const useAppState = () => {
    const [appState, setAppState] = useState(initialState)
    useEffect(() => {
        const handler = App.addListener('appStateChange', handleAppStateChange);
        App.getState().then(handleAppStateChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }

        function handleAppStateChange(state: AppState) {
            console.log("useAppState - state change", state);
            if (!canceled) {
                setAppState(state);
            }
        }
    }, [])
    return {appState};
};