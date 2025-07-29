import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Transfer from '../pages/Transfer.vue'
import Accounts from '../pages/Accounts.vue'
import Tokens from '../pages/Tokens.vue'
import Transactions from '../pages/Transactions.vue'
import AccountDetails from "../pages/AccountDetails.vue";
import LoginView from "../pages/auth/LoginView.vue";
import RegisterView from "../pages/auth/RegisterView.vue";
import Partnership from "../pages/Partnership.vue";
import TransactionDetails from "../pages/TransactionDetails.vue";

const routes = [
    {
        path: '/',
        redirect: '/tokens' // default route
    },
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
        path: '/transactions/:id',
        name: 'transaction-details',
        component: TransactionDetails
    },
    {
        path: '/transfers/:accountId',
        name: 'Transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true
    },
    {
        path: '/partnership',
        component: Partnership
    },
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/register',
        component: RegisterView
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
