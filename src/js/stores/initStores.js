import {useCounterpartyStore} from './counterpartyStore.js';
import {useNetworkStore} from './networkStore.js';
import {useUserStore} from "./userStore.js";

export async function initStores() {
    if (hasAuthToken()) {
        const counterpartyStore = useCounterpartyStore();
        const userStore = useUserStore();
        const networkStore = useNetworkStore();

        await counterpartyStore.fetchCounterparty();
        await userStore.fetchUser();
        if (counterpartyStore.counterparty?.networks?.length) {
            networkStore.setNetwork(counterpartyStore.counterparty.networks[0]);
        }
    }

    function hasAuthToken() {
        return localStorage.getItem('auth-token');
    }

}
