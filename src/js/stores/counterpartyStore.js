import {defineStore} from 'pinia';
import {ref} from 'vue';
import {fetchCounterpartyInfo} from "../../services/api.js";

export const useCounterpartyStore = defineStore('counterparty', () => {
    const counterparty = ref(null);

    async function fetchCounterparty() {
        try {
            const res = await fetchCounterpartyInfo()
            if (res.ok) {
                counterparty.value = await res.json();
            }
        } catch (err) {
            console.error('Error fetching counterparty:', err);
            counterparty.value = null;
        }
    }

    function reset() {
        counterparty.value = {};
    }

    return {
        counterparty,
        fetchCounterparty,
        reset
    };
});
