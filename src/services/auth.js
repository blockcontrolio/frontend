const authBaseUrl = import.meta.env.VITE_AUTH_BASE || `${window.location.origin}/auth`;

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