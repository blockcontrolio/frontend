<script>
import {useExplorerUtils} from "../../js/composables/explorerUtils.js";
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";
import {shortenString} from "../../js/utils.js";

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
    shortenString,
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
    <a class="ether-scan-link text-nowrap" :href="etherScanLink(this.hash)" target="_blank" rel="noopener noreferrer">
      <code>{{ this.short ? shortenString(this.hash) : this.hash }}</code>
    </a>
    <i v-if="!this.short && isClipboardSupported()" class="bi bi-clipboard pointer"
       @click="copyHash(this.hash)"
       title="Copy to clipboard">
    </i>
  </span>
</template>

<style scoped>
.ether-scan-link {
  color: #d63384; /* same as default <code> in Bootstrap */
  border-radius: 0.25rem;
  text-decoration: none;
}

.ether-scan-link:hover {
  text-decoration: underline;
}
</style>