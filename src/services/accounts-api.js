const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
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
    return await fetch(`${apiBaseUrl}/accounts/${accountId}/balances`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    }).catch(err => {
        console.error('Failed to load account asset balances', err);
    });
}

export async function fetchAssetBalance(accountId, assetId) {
    return await fetch(`${apiBaseUrl}/accounts/${accountId}/balances/${assetId}`, {
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
