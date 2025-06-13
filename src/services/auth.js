const apiBaseUrl = import.meta.env.VITE_AUTH_BASE || `${window.location.origin}`;

export async function login(credentials) {
    return await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
    });
}

export async function register(form) {
    return await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form),
    });
}