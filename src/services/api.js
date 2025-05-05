const API_URL = 'http://localhost:8080/api/v1';
let xApiKey = localStorage.getItem('x-api-key') || '';

export async function fetchAccounts() {
    const res = await fetch(`${API_URL}/accounts`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        }
    })
    return await res.json()
}

export async function sendInternalTransfer(data) {
    const res = await fetch(`${API_URL}/transfers/internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Transfer failed')
    return await res.json()
}

export async function sendExternalWithdrawal(data) {
    const res = await fetch(`${API_URL}/transfers/withdrawals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Transfer failed')
    return await res.json()
}
