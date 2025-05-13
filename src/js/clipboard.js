export function copyToClipboard(value) {
    if (isClipboardSupported()) {
        // modern secure browser
        return navigator.clipboard.writeText(value)
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    }
}

export function isClipboardSupported() {
    return navigator.clipboard && window.isSecureContext;
}
