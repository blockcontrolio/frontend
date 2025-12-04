import {createRouter, createWebHistory} from 'vue-router'
import {getAccessToken} from "../auth/tokenService";

import AuthCallback from "../pages/auth/AuthCallback.vue";
import LoginSplash from "../pages/auth/LoginSplash.vue";
import LogoutSplash from "../pages/auth/LogoutSplash.vue";
import Onboarding from "../pages/auth/Onboarding.vue";
import Dashboard from '../pages/Dashboard.vue'
import Users from "../pages/admin/Users.vue";
import Transfer from '../pages/Transfer.vue'
import PrepareInvoice from '../pages/invoices/Prepare.vue';
import Accounts from '../pages/Accounts.vue'
import Tokens from '../pages/Tokens.vue'
import Transactions from '../pages/Transactions.vue'
import AccountDetails from "../pages/AccountDetails.vue";
import Partnership from "../pages/Partnership.vue";
import TransactionDetails from "../pages/TransactionDetails.vue";
import InvoiceDetails from "../pages/invoices/Invoice.vue";
import Webhooks from "../pages/admin/Webhooks.vue";

const routes = [
    {
        path: '/auth/callback',
        name: 'auth-callback',
        component: AuthCallback
    },
    {
        path: '/login',
        name: 'login',
        component: LoginSplash,
        meta: {requiresAuth: false}
    },
    {
        path: '/logout',
        name: 'logout',
        component: LogoutSplash,
        meta: {requiresAuth: false}
    },
    {
        path: '/',
        meta: {requiresAuth: false}
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {requiresAuth: true}
    },
    {
        path: '/transfer',
        name: 'transfer',
        component: Transfer,
        meta: {requiresAuth: true}
    },
    {
        path: '/receive',
        name: 'receive',
        component: PrepareInvoice,
        meta: {requiresAuth: true}
    },
    {
        path: '/invoices/:invoiceId',
        name: 'invoice',
        component: InvoiceDetails,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/accounts',
        component: Accounts,
        meta: {requiresAuth: true}
    },
    {
        path: '/tokens',
        component: Tokens,
        meta: {requiresAuth: true}
    },
    {
        path: '/accounts/:id',
        name: 'account-details',
        component: AccountDetails,
        meta: {requiresAuth: true}
    },
    {
        path: '/accounts/:accountId/transfers',
        name: 'account-transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/transactions',
        component: Transactions,
        meta: {requiresAuth: true}
    },
    {
        path: '/transactions/:transactionId',
        name: 'transaction-details',
        component: TransactionDetails,
        meta: {requiresAuth: true}
    },
    {
        path: '/transfers',
        name: 'counterparty-transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/transfers/:transferId',
        name: 'transfer-details',
        component: () => import('../pages/TransferDetails.vue'),
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/partnership',
        component: Partnership,
        meta: {requiresAuth: true}
    },
    {
        path: '/onboarding',
        component: Onboarding,
        meta: {requiresAuth: true}
    },
    {
        path: '/webhooks',
        component: Webhooks,
        meta: {requiresAuth: true}
    },
    {
        path: '/users',
        component: Users,
        meta: {requiresAuth: true}
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    // safe public pages
    if (to.path === '/auth/callback' || to.path === '/login' || to.path === '/logout') {
        return next();
    }

    const isAuthenticated = getAccessToken();

    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/login');
    }

    next();
});

export default router;
