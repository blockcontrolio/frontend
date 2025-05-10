const API_URL = 'http://localhost:8080/api/v1';
let xApiKey = localStorage.getItem('x-api-key') || '';

export async function fetchAccounts() {
    return await fetch(`${API_URL}/accounts`, {
        headers: {
            'x-api-key': xApiKey
        }
    }).catch(err => {
        console.error('Failed to load accounts', err);
    });
}

export async function fetchTokens() {
    return await fetch(`${API_URL}/transfers/tokens`, {
        headers: {
            'x-api-key': xApiKey
        }
    }).catch(err => {
        console.error('Error fetching account:', err);
    });
}

export async function fetchAccount(id) {
    return await fetch(`${API_URL}/accounts/${id}`, {
        headers: {
            'x-api-key': xApiKey,
        },
    }).catch(err => {
        console.error('Failed to load tokens', err);
    });
}

export async function createAccount(newAccount) {
    return await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: {
            'x-api-key': xApiKey
        },
        body: JSON.stringify(newAccount)
    });
}

export async function sendInternalTransfer(data) {
    return await fetch(`${API_URL}/transfers/internal`, {
        method: 'POST',
        headers: {
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    });
}

export async function sendExternalWithdrawal(data) {
    return await fetch(`${API_URL}/transfers/withdrawals`, {
        method: 'POST',
        headers: {
            'x-api-key': xApiKey
        },
        body: JSON.stringify(data)
    })
}

export async function fetchTransactions() {
    return await fetch(`${API_URL}/transactions`, {
        headers: {
            'X-API-Key': xApiKey
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });

}