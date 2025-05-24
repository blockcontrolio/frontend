export function validateAmount(amount, allowZero = false) {
    let amountStr = amount?.toString();
    if (!amountStr) {
        return 'Amount is required';
    }

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount)) {
        return 'Amount must be a valid number';
    }

    if (!allowZero && parsedAmount <= 0) {
        return 'Amount must be greater than zero';
    }

    if (allowZero && parsedAmount < 0) {
        return 'Amount must be zero or greater';
    }

    const decimalPart = amountStr.split('.')[1];
    if (decimalPart && decimalPart.length > 18) {
        return 'Amount must have at most 18 decimal places';
    }

    return '';
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
