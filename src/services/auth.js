const authBaseUrl = import.meta.env.VITE_AUTH_BASE || `${window.location.origin}/auth`;

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