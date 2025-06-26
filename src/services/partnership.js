const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
}

export async function fetchPartnership(networkId) {
    return await fetch(`${apiBaseUrl}/partnership?networkId=${networkId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        }
    }).catch(err => {
        console.error('Failed to load other counterparties for partnership', err);
    });
}

export async function requestPartnership(targetCounterpartyId) {
    return await fetch(`${apiBaseUrl}/partnership/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify({targetCounterpartyId})
    });
}

export async function declinePartnership(targetCounterpartyId) {
    return await fetch(`${apiBaseUrl}/partnership/requests`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify({targetCounterpartyId})
    });
}

export async function acceptRequest(relationId) {
    return await fetch(`${apiBaseUrl}/partnership/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify({relationId})
    });
}

export async function rejectRequest(relationId) {
    return await fetch(`${apiBaseUrl}/partnership/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
        body: JSON.stringify({relationId})
    });
}
