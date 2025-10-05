import {defineStore} from 'pinia';
import {fetchUserInfo} from "../../services/auth.js";

export const useCounterpartyStore = defineStore('user-counterparty-info', {
    state: () => ({
        user: {
            email: '',
            role: '',
            permissions: []
        },
        counterparty: {
            id: '',
            name: '',
            networks: []
        }
    }),
    actions: {
        async fetchUserCounterpartInfo() {
            try {
                const res = await fetchUserInfo();
                if (res.ok) {
                    const data = await res.json();

                    // Assume backend returns { email, role, permissions, counterparty: {...} }
                    this.user = {
                        email: data.email,
                        role: data.role,
                        permissions: data.permissions || []
                    };

                    this.counterparty = data.counterparty || {
                        id: '',
                        name: '',
                        networks: []
                    };
                }
            } catch (err) {
                console.error('Error fetching user and counterparty info:', err);
                this.reset();
            }
        },

        reset() {
            this.user = null;
            this.counterparty = null;
        }
    }
});
