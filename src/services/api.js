const API_URL = 'http://localhost:8080/api/v1';
let xApiKey = localStorage.getItem('x-api-key') || '';

export async function fetchAccounts() {
    return await fetch(`${API_URL}/accounts`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        }
    })
}

export async function sendInternalTransfer(data) {
    return await fetch(`${API_URL}/transfers/internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    });
}

export async function sendExternalWithdrawal(data) {
    return await fetch(`${API_URL}/transfers/withdrawals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    })
}
