const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadApiKey() {
    return localStorage.getItem('x-api-key') || '';
}

export async function importToken(payload) {
    return await fetch(`${apiBaseUrl}/tokens/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function mintToken(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function burnToken(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function pause(tokenId, pauserAccountId) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/pause`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify({pauserAccountId})
    });
}

export async function unpause(tokenId, pauserAccountId) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/unpause`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify({pauserAccountId})
    });
}

export async function freeze(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/freeze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function block(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/block-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function unblock(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/unblock-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function grantRole(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/grant-role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}

export async function revokeRole(tokenId, payload) {
    return await fetch(`${apiBaseUrl}/tokens/${tokenId}/revoke-role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': loadApiKey()
        },
        body: JSON.stringify(payload)
    });
}
