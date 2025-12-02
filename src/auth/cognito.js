const domain = import.meta.env.VITE_COGNITO_USER_POOL_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
const scope = "email openid phone";

/**
 * Redirect user to Cognito authorize endpoint using PKCE.
 * This function MUST await the async code challenge before redirecting.
 */
export async function externalLogin() {
    const state = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now());
    const codeVerifier = generateCodeVerifier(); // string
    const codeChallenge = await generateCodeChallenge(codeVerifier); // await the Promise

    // persist verifier & state for the exchange step
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
    });

    // redirect
    window.location.href = `${domain}/oauth2/authorize?${params.toString()}`;
}

export async function externalRegister() {}

/**
 * Exchange the authorization code for tokens (called from your callback route).
 */
export async function exchangeCodeForToken(code, state) {
    const savedState = sessionStorage.getItem("oauth_state");
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
    if (!codeVerifier) throw new Error("Missing PKCE code verifier (sessionStorage)");
    if (state !== savedState) throw new Error("Invalid OAuth state");

    const tokenUrl = `${domain}/oauth2/token`;
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const resp = await fetch(tokenUrl, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: body.toString(),
    });

    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Token exchange failed: ${resp.status} ${txt}`);
    }

    const tokens = await resp.json();
    // optionally clear verifier/state
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");
    return tokens; // { access_token, id_token, refresh_token?, expires_in, token_type }
}

export async function logout() {
    window.location = `${domain}/logout?client_id=${clientId}` +
        `&logout_uri=${encodeURIComponent(import.meta.env.VITE_COGNITO_LOGOUT_URI)}`;
}

// PKCE helpers

/** Create a high-entropy random code_verifier (base64url, ~43-128 chars recommended) */
function generateCodeVerifier() {
    // 32 bytes -> 43 chars when base64url-encoded
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

/** Create code_challenge = BASE64URL( SHA256(code_verifier) ) */
async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(new Uint8Array(digest));
}

/** base64url encoder for byte arrays or strings */
function base64UrlEncode(input) {
    let bytes;
    if (input instanceof Uint8Array) {
        bytes = input;
    } else {
        bytes = new TextEncoder().encode(String(input));
    }
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary); // standard base64
    // base64url: replace +/ with -_, remove =
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
