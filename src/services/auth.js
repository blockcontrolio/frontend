const authBaseUrl = import.meta.env.VITE_AUTH_BASE || `${window.location.origin}/auth`;
import {clearStorage, getAccessToken} from "../auth/tokenService.js";

export async function onboard(form) {
    return await fetch(`${authBaseUrl}/onboarding`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(form),
    });
}

export async function fetchUserInfo() {
    let response = fetch(`${authBaseUrl}/user-info`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
    // global handling
    if (response.status === 401 || response.status === 403) {
        clearStorage();
        throw new Error('Not authenticated or session expired. Please login.');
    }
    return await response.catch(err => {
        console.error('Failed to load logged in user info', err);
    });
}
