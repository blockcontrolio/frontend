import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/theme.css'
import router from './router'
import {initStores} from './js/stores/initStores.js';
import {isJwtExpired} from "./services/auth.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const token = localStorage.getItem('auth-token');

if (token && isJwtExpired(token)) {
    localStorage.removeItem('auth-token');
    window.location.href = '/login';
}

// Wrap await in async function
// Fixes older browser support. ERROR: Top-level await is not available
(async () => {
    await initStores(); // initialize counterparty, selected network, etc
    app.mount('#app');
})();
