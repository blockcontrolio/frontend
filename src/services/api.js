const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
}

export async function fetchNetworks() {
    return await fetch(`${apiBaseUrl}/networks`, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(err => {
        console.error('Failed to load all networks info', err);
    });
}

export async function fetchCounterpartyInfo() {
    const response = fetch(`${apiBaseUrl}/counterparties`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    });
    // Global 403 handling
    if (response.status === 403) {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
        throw new Error('Session expired. Redirecting to login.');
    }
    return await response.catch(err => {
        console.error('Failed to load counterparties info', err);
    });
}

export async function fetchAccounts() {
    return await fetch(`${apiBaseUrl}/accounts`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Failed to load accounts', err);
    });
}

export async function fetchTokens() {
    return await fetch(`${apiBaseUrl}/tokens`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Error fetching account:', err);
    });
}

export async function createToken(payload) {
    return await fetch(`${apiBaseUrl}/tokens`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(payload)
    });
}

export async function fetchAccount(id) {
    return await fetch(`${apiBaseUrl}/accounts/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    }).catch(err => {
        console.error('Failed to load tokens', err);
    });
}

export async function updateAccount(id, accountInfo) {
    return await fetch(`${apiBaseUrl}/accounts/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(accountInfo),
    })
}

export async function fetchAssetBalances(accountId) {
    return await fetch(`${apiBaseUrl}/accounts/${accountId}/asset-balances`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    }).catch(err => {
        console.error('Failed to load account asset balances', err);
    });
}

export async function fetchAssetBalance(accountId, assetId) {
    return await fetch(`${apiBaseUrl}/accounts/${accountId}/asset-balances/${assetId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    }).catch(err => {
        console.error('Failed to load account asset balances', err);
    });
}

export async function createAccount(accountInfo) {
    return await fetch(`${apiBaseUrl}/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(accountInfo)
    });
}

export async function fetchTransfers(accountId) {
    const url = new URL(`${apiBaseUrl}/transfers`);

    if (accountId !== undefined) {
        url.searchParams.set('accountId', accountId);
    }

    return await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
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
            'Authorization': `Bearer ${loadAuthToken()}`
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
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(data)
    });
}

export async function sendExternalWithdrawal(data) {
    return await fetch(`${apiBaseUrl}/transfers/withdrawals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(data)
    })
}

export async function sendCrossCounterparty(data) {
    return await fetch(`${apiBaseUrl}/transfers/cross-counterparty`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify(data)
    })
}

export async function fetchTransactions() {
    return await fetch(`${apiBaseUrl}/transactions`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });

}

export async function fetchTransaction(internalId) {
    return await fetch(`${apiBaseUrl}/transactions/${internalId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Failed to fetch transactions', err);
    });
}
