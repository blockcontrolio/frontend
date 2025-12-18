import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/theme.css'
import router from './router'
import {initStores} from './js/stores/initStores.js';
import {clearStorage, getAccessToken, isTokenExpired} from "./auth/tokenService.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const token = getAccessToken();

if (token && isTokenExpired(token)) {
    clearStorage();
}

// Wrap await in async function
// Fixes older browser support. ERROR: Top-level await is not available
(async () => {
    await initStores(); // initialize counterparty, selected network, etc
    app.mount('#app');
})();
