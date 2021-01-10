import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {getLogger} from "../core";
import {ObjectiveProps} from "./ObjectiveProps";
import {Plugins} from "@capacitor/core";

import {
    createObjective,
    eraseObjective,
    getObjective,
    getObjectives,
    newWebSocket,
    updateObjective
} from "./ObjectiveApi";
import {AuthContext} from "../auth";

const log = getLogger("ObjectiveProvider");
const {Storage} = Plugins;

type SaveObjectiveFn = (objective: ObjectiveProps, connected: boolean) => Promise<any>;
type DeleteObjectiveFn = (objective: ObjectiveProps, connected: boolean) => Promise<any>;
type UpdateServerFn = () => Promise<any>;
type ServerObjective = (id: string, version: number) => Promise<any>;

export interface ObjectivesState {
    objectives?: ObjectiveProps[];
    oldObjective?: ObjectiveProps,
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    deleting: boolean;
    savingError?: Error | null;
    deletingError?: Error | null;
    saveObjective?: SaveObjectiveFn;
    deleteObjective?: DeleteObjectiveFn;
    updateServer?: UpdateServerFn;
    getServerObjective?: ServerObjective;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: ObjectivesState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";
const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";

const SAVE_ITEM_SUCCEEDED_OFFLINE = "SAVE_ITEM_SUCCEEDED_OFFLINE";
const CONFLICT = "CONFLICT";
const CONFLICT_SOLVED = "CONFLICT_SOLVED";

const reducer: (state: ObjectivesState, action: ActionProps) => ObjectivesState = (
    state,
    {type, payload}
) => {
    switch (type) {
        case FETCH_ITEMS_STARTED:
            return {...state, fetching: true, fetchingError: null};
        case FETCH_ITEMS_SUCCEEDED:
            return {...state, objectives: payload.objectives, fetching: false};
        case FETCH_ITEMS_FAILED:
            return {...state, objectives: payload.objectives, fetching: false};
        case SAVE_ITEM_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_ITEM_SUCCEEDED:
            const objectives = [...(state.objectives || [])];
            const objective = payload.objective;
            if (objective._id !== undefined) {
                const index = objectives.findIndex((it) => it._id === objective._id);
                if (index === -1) {
                    objectives.splice(0, 0, objective);
                } else {
                    objectives[index] = objective;
                }
                return {...state, objectives, saving: false};
            }
            return {...state, objectives};

        case SAVE_ITEM_SUCCEEDED_OFFLINE: {
            const objectives = [...(state.objectives || [])];
            const objective = payload.objective;
            const index = objectives.findIndex((it) => it._id === objective._id);
            if (index === -1) {
                objectives.splice(0, 0, objective);
            } else {
                objectives[index] = objective;
            }
            return {...state, objectives, saving: false};
        }

        case CONFLICT: {
            log("CONFLICT: " + JSON.stringify(payload.objective));
            return {...state, oldObjective: payload.objective};
        }

        case CONFLICT_SOLVED: {
            log("CONFLICT_SOLVED");
            return {...state, oldObjective: undefined};
        }

        case SAVE_ITEM_FAILED:
            return {...state, savingError: payload.error, saving: false};

        case DELETE_ITEM_STARTED:

            return {...state, deletingError: null, deleting: true};
        case DELETE_ITEM_SUCCEEDED: {
            const objectives = [...(state.objectives || [])];
            const objective = payload.objective;
            const index = objectives.findIndex((it) => it._id === objective._id);
            objectives.splice(index, 1);
            return {...state, objectives, deleting: false};
        }

        case DELETE_ITEM_FAILED:
            return {...state, deletingError: payload.error, deleting: false};

        default:
            return state;
    }
};

export const ObjectiveContext = React.createContext<ObjectivesState>(initialState);

interface ObjectiveProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const ObjectiveProvider: React.FC<ObjectiveProviderProps> = ({children}) => {
    const {token, _id} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        objectives,
        fetching,
        fetchingError,
        saving,
        savingError,
        deleting,
        deletingError,
        oldObjective
    } = state;
    useEffect(getObjectivesEffect, [token]);
    useEffect(wsEffect, [token]);

    const saveObjective = useCallback<SaveObjectiveFn>(saveObjectivesCallback, [token]);

    const deleteObjective = useCallback<DeleteObjectiveFn>(deleteObjectiveCallback, [token]);

    const updateServer = useCallback<UpdateServerFn>(updateServerCallback, [
        token,
    ]);

    const getServerObjective = useCallback<ServerObjective>(objectiveServer, [token]);

    const value = {
        objectives,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveObjective: saveObjective,
        deleting,
        deleteObjective: deleteObjective,
        deletingError,
        updateServer,
        getServerObjective,
        oldObjective
    };


    log("returns");
    return <ObjectiveContext.Provider value={value}>{children}</ObjectiveContext.Provider>;


    async function objectiveServer(id: string, version: number) {
        const oldObjective = await getObjective(token, id);
        if (oldObjective.version !== version) {
            dispatch({type: CONFLICT, payload: {objective: oldObjective}});
        }
    }

    async function updateServerCallback() {
        console.log('update Servers')
        const allKeys = Storage.keys();
        let promisedObjectives;
        var i;

        promisedObjectives = await allKeys.then(function (allKeys) {
            const promises = [];
            for (i = 0; i < allKeys.keys.length; i++) {
                const promiseObjective = Storage.get({key: allKeys.keys[i]});

                promises.push(promiseObjective);
            }
            return promises;
        });

        for (i = 0; i < promisedObjectives.length; i++) {
            const promise = promisedObjectives[i];
            const objective = await promise.then(function (it) {
                var object;
                try {
                    object = JSON.parse(it.value!);
                } catch (e) {
                    return null;
                }
                return object;
            });
            log("Objective: " + JSON.stringify(objective));
            if (objective !== null) {
                if (objective.status === 1) {
                    console.log("status 1");
                    dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {objective: objective}});
                    await Storage.remove({key: objective._id});
                    const oldObjective = objective;
                    delete oldObjective._id;
                    oldObjective.status = 0;
                    const newObjective = await createObjective(token, oldObjective);
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {objective: newObjective}});
                    await Storage.set({
                        key: JSON.stringify(newObjective._id),
                        value: JSON.stringify(newObjective),
                    });
                } else if (objective.status === 2) {
                    objective.status = 0;
                    console.log("status 2");
                    const newObjective = await updateObjective(token, objective);
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {objective: newObjective}});
                    await Storage.set({
                        key: JSON.stringify(newObjective._id),
                        value: JSON.stringify(newObjective),
                    });
                } else if (objective.status === 3) {
                    console.log("status 3");
                    objective.status = 0;
                    await eraseObjective(token, objective);
                    await Storage.remove({key: objective._id});
                }
            }
        }
    }


    function getObjectivesEffect() {
        let canceled = false;
        fetchObjectives();
        return () => {
            canceled = true;
        };

        async function fetchObjectives() {
            if (!token?.trim()) {
                return;
            }
            try {
                log("fetchObjectives started");
                dispatch({type: FETCH_ITEMS_STARTED});
                const objectives = await getObjectives(token);
                log("fetchObjectives succeeded");
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {objectives: objectives}});
                }
            } catch (error) {
                const allKeys = Storage.keys();
                let promisedObjectives;
                var i;

                promisedObjectives = await allKeys.then(function (allKeys) {

                    const promises = [];
                    for (i = 0; i < allKeys.keys.length; i++) {
                        const promiseObjective = Storage.get({key: allKeys.keys[i]});

                        promises.push(promiseObjective);
                    }
                    return promises;
                });

                const objectives_aux = [];
                for (i = 0; i < promisedObjectives.length; i++) {
                    const promise = promisedObjectives[i];
                    const objective = await promise.then(function (it) {
                        var object;
                        try {
                            object = JSON.parse(it.value!);
                        } catch (e) {
                            return null;
                        }
                        if (object.status !== 2) {
                            return object;
                        }
                        return null;
                    });
                    if (objective != null) {
                        objectives_aux.push(objective);
                    }
                }

                const objectives = objectives_aux;
                dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {objectives: objectives}});
            }
        }
    }

    function random_id() {
        return "_" + Math.random().toString(36).substr(2, 9);
    }


    async function saveObjectivesCallback(objective: ObjectiveProps, connected: boolean) {
        try {
            console.log('in save callback')
            if (!connected) {
                throw new Error();
            }
            log("saveObjective started");
            dispatch({type: SAVE_ITEM_STARTED});
            const savedObjective = await (objective._id
                ? updateObjective(token, objective)
                : createObjective(token, objective));
            console.log('succes save')
            log("saveObjective succeeded");
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {objective: savedObjective}});
            dispatch({type: CONFLICT_SOLVED});
            console.log('succes save2s')
        } catch (error) {
            log("saveObjective failed with error:", error);
            console.log('in save cerror')
            if (objective._id === undefined) {
                objective._id = random_id();
                objective.status = 1;
            } else {
                objective.status = 2;
                alert("Objective updated locally");
            }
            await Storage.set({
                key: objective._id,
                value: JSON.stringify(objective),
            });

            dispatch({type: SAVE_ITEM_SUCCEEDED_OFFLINE, payload: {objective: objective}});
        }
    }

    async function deleteObjectiveCallback(objective: ObjectiveProps, connected: boolean) {
        try {
            if (!connected) {
                throw new Error();
            }
            console.log('in delete')
            dispatch({type: DELETE_ITEM_STARTED});
            const deletedObjective = await eraseObjective(token, objective);
            await Storage.remove({key: objective._id!});
            dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {objective: objective}});
            console.log('delete succeded delete')
        } catch (error) {

            objective.status = 3;
            await Storage.set({
                key: JSON.stringify(objective._id),
                value: JSON.stringify(objective),
            });
            alert("Objective deleted locally");
            dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {objective: objective}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log("wsEffect - connecting");
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type} = message;
                log(`ws message, objective ${type}`);
                if (type === "created" || type === "updated") {
                    //dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { cityBreak } });
                }
            });
        }
        return () => {
            log("wsEffect - disconnecting");
            canceled = true;
            closeWebSocket?.();
        };
    }

};
