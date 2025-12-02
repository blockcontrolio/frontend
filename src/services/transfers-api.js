const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;
import {getAccessToken} from "../auth/tokenService.js";

export async function fetchTransfers(accountId) {
    const url = new URL(`${apiBaseUrl}/transfers`);

    if (accountId !== undefined) {
        url.searchParams.set('accountId', accountId);
    }

    return await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load account transfers', err);
    });
}

export async function fetchTransferDetails(transferId) {
    const url = new URL(`${apiBaseUrl}/transfers/${transferId}`);

    return await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load account transfers', err);
    });
}

export async function sendInternalTransfer(data) {
    return await fetch(`${apiBaseUrl}/transfers/internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
    });
}

export async function sendExternalWithdrawal(data) {
    return await fetch(`${apiBaseUrl}/transfers/external`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
    })
}

export async function sendCrossCounterparty(data) {
    return await fetch(`${apiBaseUrl}/transfers/cross-counterparty`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
    })
}
