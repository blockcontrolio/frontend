<script>
import {useExplorerUtils} from "../../js/composables/explorerUtils.js";
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";

export default {
  name: "AddrScanLink",
  props: ['type', 'address', 'short'],
  setup() {
    const {tokenLink, walletLink} = useExplorerUtils();

    return {
      tokenLink,
      walletLink
    };
  },
  methods: {
    shortenString() {
      return this.address.substring(0, 7) + '...' + this.address.substring(this.address.length - 5);
    },
    isClipboardSupported,
    copyAddress(address) {
      copyToClipboard(address)
          .then(() => {
            console.log(this.type + ' address copied:', address);
            // optional: show toast or temporary success indicator
          });
    },
    buildLink() {
      switch (this.type) {
        case 'token' : {
          return this.tokenLink(this.address);
        }
        case 'account' : {
          return this.walletLink(this.address);
        }
      }
    }
  }
}
</script>

<template>
  <span class="d-flex align-items-center gap-2">
    <a class="ether-scan-link text-nowrap mono" :href="buildLink()" target="_blank"
       rel="noopener noreferrer">
      {{ this.short ? shortenString() : this.address }}
    </a>
    <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer small"
       @click="copyAddress(this.address)"
       title="Copy to clipboard">
    </i>
  </span>
</template>

<style>
.ether-scan-link {
  text-decoration: none;
}

.ether-scan-link:hover {
  text-decoration: underline;
}
</style>