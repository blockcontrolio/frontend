import {useCounterpartyStore} from './counterpartyStore.js';
import {useNetworkStore} from './networkStore.js';

export async function initStores() {
    if (hasAuthToken()) {
        const counterpartyStore = useCounterpartyStore();
        const networkStore = useNetworkStore();

        await counterpartyStore.fetchUserCounterpartInfo();
        if (counterpartyStore.counterparty?.networks?.length) {
            networkStore.setNetwork(counterpartyStore.counterparty.networks[0]);
        }
    }

    function hasAuthToken() {
        return localStorage.getItem('auth-token');
    }

}
