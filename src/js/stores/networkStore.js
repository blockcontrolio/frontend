import {defineStore} from 'pinia';
import {fetchNetworks} from "../../services/api.js";

export const useNetworkStore = defineStore('network', {
    state: () => ({
        networks: [],
        selectedNetwork: null,
    }),
    actions: {
        async fetchNetworks() {
            try {
                const res = await fetchNetworks()
                if (res.ok) {
                    this.networks = await res.json();
                }
            } catch (err) {
                console.error('Error fetching networks:', err);
                this.networks = [];
            }
        },
        setNetwork(network) {
            this.selectedNetwork = network;
        },
        reset() {
            this.selectedNetwork = null;
        }
    }
});
