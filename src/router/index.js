import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Transfer from '../pages/Transfer.vue'
import Accounts from '../pages/Accounts.vue'
import Tokens from '../pages/Tokens.vue'
import Transactions from '../pages/Transactions.vue'
import Settings from '../pages/Settings.vue'
import AccountDetails from "../pages/AccountDetails.vue";

const routes = [
    {path: '/', component: Dashboard},
    {
        path: '/transfer',
        name: 'Transfer',
        component: Transfer
    },
    {
        path: '/accounts',
        component: Accounts
    },
    {
        path: '/tokens',
        component: Tokens
    },
    {
        path: '/accounts/:id',
        name: 'account-details',
        component: AccountDetails
    },
    {
        path: '/transactions',
        component: Transactions
    },
    {
        path: '/transfers/:accountId',
        name: 'Transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true
    },
    {path: '/settings', component: Settings}
]

export default createRouter({
    history: createWebHistory(),
    routes
})
