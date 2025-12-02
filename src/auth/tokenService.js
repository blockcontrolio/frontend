export function saveTokens({access_token, id_token}) {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("id_token", id_token);
}

export function getAccessToken() {
    return localStorage.getItem("access_token");
}

export function clearStorage() {
    localStorage.clear();
}

export function isTokenExpired(token) {
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
