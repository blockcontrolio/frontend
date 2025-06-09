import {useCounterpartyStore} from "./counterpartyStore.js";
import {useNetworkStore} from "./networkStore.js";

export function resetAllStores() {
    useCounterpartyStore().reset();
    useNetworkStore().reset();
}
