const apiBaseUrl = import.meta.env.VITE_API_BASE || `${window.location.origin}/api/v1`;
import {getAccessToken} from "../auth/tokenService";

export async function fetchNetworks() {
    return await fetch(`${apiBaseUrl}/networks`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load all networks info', err);
    });
}

export async function fetchUsers() {
    return await fetch(`${apiBaseUrl}/users`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load users', err);
    });
}

export async function addUser(userRequest) {
    return await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(userRequest),
    });
}

export async function assignPermission(user, permission) {
    const userId = user.email;
    return await fetch(`${apiBaseUrl}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({permissions: [permission]}),
    });
}

export async function removePermission(user, permission) {
    const userId = user.email;
    return await fetch(`${apiBaseUrl}/users/${userId}/permissions`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({permissions: [permission]}),
    });
}

export async function fetchWebhooks() {
    return await fetch(`${apiBaseUrl}/webhooks`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load webhooks', err);
    });
}

export async function addWebhook(webhookRequest) {
    return await fetch(`${apiBaseUrl}/webhooks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(webhookRequest),
    });
}

export async function removeWebhook(id) {
    return await fetch(`${apiBaseUrl}/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });
}

export async function fetchApiKeys() {
    return await fetch(`${apiBaseUrl}/users/api-keys`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    }).catch(err => {
        console.error('Failed to load api-keys', err);
    });
}

export async function generateApiKey() {
    return await fetch(`${apiBaseUrl}/users/api-keys`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
}

export async function revokeApiKey(keyId) {
    return await fetch(`${apiBaseUrl}/users/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
}
