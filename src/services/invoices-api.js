const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;
import {getAccessToken} from "../auth/tokenService.js";

export async function prepareCrossCounterpartyInvoice(data) {
    return await fetch(`${apiBaseUrl}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
    })
}

export async function fetchInvoicesForPayer() {
    return await fetch(`${apiBaseUrl}/invoices/payer`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to get pending invoices for payer', err);
    });
}

export async function fetchInvoicesForReceiver() {
    return await fetch(`${apiBaseUrl}/invoices/receiver`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to get pending invoices for payer', err);
    });
}

export async function fetchInvoice(invoiceId) {
    return await fetch(`${apiBaseUrl}/invoices/${invoiceId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to get invoice by invoiceId', err);
    });
}

export async function cancelInvoice(invoiceId) {
    return await fetch(`${apiBaseUrl}/invoices/${invoiceId}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
}

export async function rejectInvoice(invoiceId) {
    return await fetch(`${apiBaseUrl}/invoices/${invoiceId}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
}

export async function executeInvoice(invoiceId, payerAccountId) {
    return await fetch(`${apiBaseUrl}/invoices/${invoiceId}/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({payerAccountId})
    });
}
