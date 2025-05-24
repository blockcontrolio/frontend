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
