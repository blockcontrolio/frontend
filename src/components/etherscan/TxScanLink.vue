<script>
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";
import {etherScanLink} from "../../js/utils.js";

export default {
  name: "TxScanLink",
  props: ['hash'],
  methods: {
    etherScanLink,
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
  <span class="mono d-flex align-items-center gap-2">
    <a class="ether-scan-link" :href="etherScanLink(this.hash)" target="_blank" rel="noopener noreferrer">
      <code>{{ this.hash }}</code>
    </a>
    <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer text-info"
       @click="copyHash(this.hash)"
       title="Copy to clipboard">
    </i>
  </span>
</template>

<style scoped>
.ether-scan-link {
  font-size: 1em;
  color: #d63384; /* same as default <code> in Bootstrap */
  border-radius: 0.25rem;
  text-decoration: none;
}

.ether-scan-link:hover {
  text-decoration: underline;
}
</style>