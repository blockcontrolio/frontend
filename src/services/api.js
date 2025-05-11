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
    return await fetch(`${API_URL}/tokens`, {
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

export async function updateAccount(id, accountInfo) {
    await fetch(`${API_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey,
        },
        body: JSON.stringify(accountInfo),
    }).catch(err => {
        console.error('Error updating account:', err);
    });
}

export async function fetchBalances(accountId) {
    return await fetch(`${API_URL}/accounts/${accountId}/balances`, {
        headers: {
            'x-api-key': xApiKey,
        },
    }).catch(err => {
        console.error('Failed to load account balance', err);
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

export async function fetchTransactions() {
    return await fetch(`${API_URL}/transactions`, {
        headers: {
            'X-API-Key': xApiKey
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });

}