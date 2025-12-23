import {defineStore} from 'pinia';
import {fetchUserInfo} from "../../services/onboarding.js";

export const useCounterpartyStore = defineStore('user-counterparty-info', {
    state: () => ({
        user: {
            email: '',
            role: '',
            permissions: []
        },
        isOnboarded: false,
        counterparty: {
            id: '',
            name: '',
            network: []
        }
    }),
    actions: {
        async fetchUserCounterpartyInfo() {
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
                    this.isOnboarded = data.isOnboarded;
                    this.counterparty = data.counterparty || {
                        id: '',
                        name: '',
                        network: []
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
