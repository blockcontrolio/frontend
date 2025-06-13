import {defineStore} from 'pinia';

export const useNetworkStore = defineStore('network', {
    state: () => ({
        networks: [],
        selectedNetwork: null,
    }),
    actions: {
        async fetchNetworks() {
            // Mocked response
            this.networks = [
                {internalId: '11111111-1111-1111-1111-111111111111', name: 'Ethereum Testnet'},
                {internalId: '22222222-2222-2222-2222-222222222222', name: 'Polygon'}
            ];
        },
        setNetwork(network) {
            this.selectedNetwork = network;
        },
        reset() {
            this.selectedNetwork = null;
        }
    }
});
