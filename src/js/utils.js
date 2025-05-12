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
