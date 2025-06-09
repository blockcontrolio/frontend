import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useNetworkStore = defineStore('global', () => {
    // your full object, e.g., { chainId, name, explorerUrl }
    const selectedNetwork = ref(null);

    function setNetwork(network) {
        selectedNetwork.value = network;
    }

    function reset() {
        selectedNetwork.value = null;
    }

    return {
        selectedNetwork,
        setNetwork,
        reset,
    };
});
