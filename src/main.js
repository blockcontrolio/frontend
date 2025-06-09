import {createApp} from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/theme.css'
import router from './router'

const pinia = createPinia();

createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')
