const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;
import {getAccessToken} from "../auth/tokenService.js";

export async function fetchTransactions() {
    return await fetch(`${apiBaseUrl}/transactions`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });

}

export async function fetchTransaction(id) {
    return await fetch(`${apiBaseUrl}/transactions/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });
}
