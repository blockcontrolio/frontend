<script>
import {useExplorerUtils} from "../../js/composables/explorerUtils.js";
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";

export default {
  name: "TxScanLink",
  props: ['hash', 'short'],
  setup() {
    const {etherScanLink} = useExplorerUtils();

    return {
      etherScanLink,
    };
  },
  methods: {
    shortenString() {
      return this.hash.substring(0, 7) + '...' + this.hash.substring(this.hash.length - 5);
    },
    isClipboardSupported,
    copyHash(txHash) {
      copyToClipboard(txHash)
          .then(() => {
            console.log('tx hash copied:', txHash);
            // optional: show toast or temporary success indicator
          });
    }
  }
}
</script>

<template>
  <span class="d-flex align-items-center gap-2">
    <a class="ether-scan-link text-nowrap mono" :href="etherScanLink(this.hash)" target="_blank" rel="noopener noreferrer">
      <code>{{ this.short ? shortenString() : this.hash }}</code>
    </a>
    <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer small"
       @click="copyHash(this.hash)"
       title="Copy to clipboard">
    </i>
  </span>
</template>

<style scoped>
.ether-scan-link {
  color: #d63384;
  text-decoration: none;
}

.ether-scan-link:hover {
  text-decoration: underline;
}
</style>