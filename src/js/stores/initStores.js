import {useCounterpartyStore} from './counterpartyStore.js';
import {useNetworkStore} from './networkStore.js';
import {getAccessToken} from "../../auth/tokenService.js";

export async function initStores() {
    if (hasAuthToken()) {
        const counterpartyStore = useCounterpartyStore();
        const networkStore = useNetworkStore();

        await counterpartyStore.fetchUserCounterpartInfo();
        if (counterpartyStore.counterparty?.network) {
            networkStore.setNetwork(counterpartyStore.counterparty.network);
        }
    }

    function hasAuthToken() {
        return getAccessToken();
    }

}
