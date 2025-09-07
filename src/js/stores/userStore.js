import {defineStore} from 'pinia';
import {fetchUserInfo} from "../../services/auth.js";

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {
            email: '',
            role: '',
            permissions: []
        },
    }),
    actions: {

        async fetchUser() {
            try {
                const res = await fetchUserInfo()
                if (res.ok) {
                    this.user = await res.json();
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                this.user = null;
            }
        },

        reset() {
            this.user = null;
        }
    }
});
