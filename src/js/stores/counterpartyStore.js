import {defineStore} from 'pinia';
import {fetchCounterpartyInfo} from "../../services/api.js";

export const useCounterpartyStore = defineStore('counterparty', {
    state: () => ({
        counterparty: {
            internalId: '',
            name: '',
            networks: []
        },
    }),
    actions: {

        async fetchCounterparty() {
            try {
                const res = await fetchCounterpartyInfo()
                if (res.ok) {
                    this.counterparty = await res.json();
                }
            } catch (err) {
                console.error('Error fetching counterparty:', err);
                this.counterparty = null;
            }
        },

        reset() {
            this.counterparty = null;
        }
    }
});
