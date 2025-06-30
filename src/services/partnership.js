const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
}

export async function fetchPartnership(networkId) {
    return await fetch(`${apiBaseUrl}/partnerships?networkId=${networkId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Failed to load other counterparties for partnership', err);
    });
}

export async function requestPartnership(targetCounterpartyId) {
    return await fetch(`${apiBaseUrl}/partnerships`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify({targetCounterpartyId})
    });
}

export async function declinePartnership(relationId) {
    return await fetch(`${apiBaseUrl}/partnerships/${relationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    });
}

export async function acceptRequest(relationId) {
    return await fetch(`${apiBaseUrl}/partnerships/${relationId}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    });
}

export async function rejectRequest(relationId) {
    return await fetch(`${apiBaseUrl}/partnerships/${relationId}/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    });
}
