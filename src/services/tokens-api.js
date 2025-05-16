const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadApiKey() {
    return localStorage.getItem('x-api-key') || '';
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
