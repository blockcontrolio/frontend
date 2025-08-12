export function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function formatAmount(value) {
    if (value === null || value === undefined) return '0';
    return Number(value).toFixed(20).replace(/\.?0+$/, ''); // removes trailing zeroes
}

export function roundAmount(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    // Round safely to 6 decimal places
    const rounded = Math.round(Number(value) * 1e6) / 1e6;
    // Convert to string without forcing extra zeros
    return rounded.toString();
}
