const authBaseUrl = import.meta.env.VITE_AUTH_BASE || `${window.location.origin}/auth`;

function loadAuthToken() {
    return localStorage.getItem('auth-token') || '';
}

export function isJwtExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    } catch (e) {
        // expire invalid or malformed tokens as well
        return true;
    }
}

export async function login(credentials) {
    return await fetch(`${authBaseUrl}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
    });
}

export async function register(form) {
    return await fetch(`${authBaseUrl}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form),
    });
}

export async function fetchUserInfo() {
    let response = fetch(`${authBaseUrl}/user-info`, {
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
        console.error('Failed to load logged in user info', err);
    });
}
