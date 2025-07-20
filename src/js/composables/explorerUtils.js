import {useNetworkStore} from "../stores/networkStore.js";

export function useExplorerUtils() {
    const networkStore = useNetworkStore();

    function etherScanLink(txHash) {
        let explorerUrl = networkStore.selectedNetwork?.explorerUrl;
        return explorerUrl ? `${explorerUrl}/tx/${txHash}` : '';
    }

    function tokenLink(address) {
        let explorerUrl = networkStore.selectedNetwork?.explorerUrl;
        return explorerUrl ? `${explorerUrl}/token/${address}` : '';
    }

    function walletLink(address) {
        let explorerUrl = networkStore.selectedNetwork?.explorerUrl;
        return explorerUrl ? `${explorerUrl}/address/${address}` : '';
    }

    return {
        etherScanLink,
        tokenLink,
        walletLink
    };

}
