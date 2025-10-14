const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
}

export async function fetchRawPartnerships(networkId) {
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
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    });
}

export async function rejectRequest(relationId) {
    return await fetch(`${apiBaseUrl}/partnerships/${relationId}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadAuthToken()}`
        },
    });
}

export async function fetchAcceptedPartnerships(networkId, counterpartyId) {
    const res = await fetchRawPartnerships(networkId);
    const partnershipsRaw = await res.json();

    return await partnershipsRaw
        .filter(p => p.status === 'ACCEPTED')
        .map(p => {
            let partner = null;

            if (p.sourceCounterparty?.id === counterpartyId) {
                partner = p.targetCounterparty;
            } else if (p.targetCounterparty?.id === counterpartyId) {
                partner = p.sourceCounterparty;
            }

            if (partner) {
                return {
                    ...partner,
                    availableAssets: p.availableAssets || [],
                    partneredAssets: p.partneredAssets || [],
                    targetAccounts: p.targetAccounts || []
                };
            }

            return null;
        })
        .filter(Boolean);
}
