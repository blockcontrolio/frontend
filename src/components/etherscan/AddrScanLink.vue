<script>
import {useExplorerUtils} from "../../js/composables/explorerUtils.js";
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";

export default {
  name: "AddrScanLink",
  props: ['type', 'address'],
  setup() {
    const {tokenLink, walletLink} = useExplorerUtils();

    return {
      tokenLink,
      walletLink
    };
  },
  methods: {
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
  <span class="mono">
    <a class="text-decoration-none me-2" :href="buildLink()" target="_blank"
       rel="noopener noreferrer">
      {{ this.address }}
    </a>
    <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer"
       @click="copyAddress(this.address)"
       title="Copy to clipboard">
    </i>
  </span>
</template>
