export function validateAmount(amount) {
    let amountStr = amount?.toString();
    if (!amountStr || parseFloat(amountStr) <= 0) {
        return 'Amount must be greater than zero';
    }
    const decimalPart = amountStr.split('.')[1];
    if (decimalPart && decimalPart.length > 18) {
        return 'Amount must have at most 18 decimal places';
    } else {
        return '';
    }
}

export function validateAddress(address) {
    const hexRegex = /^0x[a-fA-F0-9]{6,}$/;
    if (!address) {
        return 'Address is required';
    } else if (address.length !== 42) {
        return 'Hex string has invalid length';
    } else if (!hexRegex.test(address)) {
        return 'Must be a valid hex string (e.g., 0x123abc...)';
    } else {
        return '';
    }
}
