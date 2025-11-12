import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Users from "../pages/admin/Users.vue";
//
import Transfer from '../pages/Transfer.vue'
import PrepareInvoice from '../pages/invoices/Prepare.vue';
import Accounts from '../pages/Accounts.vue'
import Tokens from '../pages/Tokens.vue'
import Transactions from '../pages/Transactions.vue'
import AccountDetails from "../pages/AccountDetails.vue";
import LoginView from "../pages/auth/LoginView.vue";
import RegisterView from "../pages/auth/RegisterView.vue";
import Partnership from "../pages/Partnership.vue";
import TransactionDetails from "../pages/TransactionDetails.vue";
import InvoiceDetails from "../pages/invoices/Invoice.vue";
import Webhooks from "../pages/admin/Webhooks.vue";

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
        path: '/receive',
        name: 'Receive',
        component: PrepareInvoice
    },
    {
        path: '/invoices/:invoiceId',
        name: 'Invoice',
        component: InvoiceDetails,
        props: true
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
        path: '/accounts/:accountId/transfers',
        name: 'account-transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true
    },
    {
        path: '/transactions',
        component: Transactions
    },
    {
        path: '/transactions/:transactionId',
        name: 'transaction-details',
        component: TransactionDetails
    },
    {
        path: '/transfers',
        name: 'counterparty-transfers',
        component: () => import('../pages/AccountTransfers.vue'),
        props: true
    },
    {
        path: '/transfers/:transferId',
        name: 'transfer-details',
        component: () => import('../pages/TransferDetails.vue'),
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
    },
    {
        path: '/webhooks',
        component: Webhooks
    },
    {
        path: '/users',
        component: Users
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authToken = localStorage.getItem('auth-token');
    const isAuthenticated = !!authToken;

    if (!isAuthenticated && to.path !== '/login' && to.path !== '/register') {
        next('/login');
    } else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
        next('/register'); // redirect logged-in users away from login/register
    } else {
        next();
    }
});

export default router;
