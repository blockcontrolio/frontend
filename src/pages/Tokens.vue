<script>
import {createToken, fetchAccounts, fetchTokens} from "../services/api.js";
import {mintToken, burnToken, importToken} from "../services/tokens-api.js";
import {copyToClipboard, isClipboardSupported} from "../js/clipboard.js"
import {tokenLink} from "../js/utils.js";
import MintTokenModal from "../components/modal/MintTokenModal.vue";
import BurnTokenModal from "../components/modal/BurnTokenModal.vue"

export default {
  name: 'Tokens',
  components: {MintTokenModal, BurnTokenModal},
  data() {
    return {
      tokens: [],
      accounts: [],
      showImportForm: false,
      showCreateForm: false,
      importTokenAddress: '',
      newToken: {
        name: '',
        symbol: '',
        accountId: ''
      },
      showMint: false,
      showBurn: false,
      selectedToken: {}
    };
  },
  mounted() {
    this.fetchTokens();
  },
  methods: {
    tokenLink,
    async fetchTokens() {
      const res = await fetchTokens();
      this.tokens = await res.json();
    },
    async fetchAccounts() {
      const res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async importToken() {
      const res = await importToken({address: this.importTokenAddress});
      if (res.ok) {
        this.showImportForm = false;
        this.importTokenAddress = '';
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    },
    async createToken() {
      const payload = {
        name: this.newToken.name,
        symbol: this.newToken.symbol,
        accountId: this.newToken.accountId
      };

      const res = await createToken(payload);
      if (res.ok) {
        this.showCreateForm = false;
        this.newToken = {name: '', symbol: '', accountId: ''};
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    },
    isClipboardSupported,
    copyAddress(address) {
      copyToClipboard(address)
          .then(() => {
            console.log('Wallet address copied:', address);
            // optional: show toast or temporary success indicator
          });
    },
    openMintModal(token) {
      this.selectedToken = token;
      this.showMint = true;
    },
    sendMintRequest({ tokenId, issuerAccountId, recipientAccountId, amount }) {
      mintToken(tokenId, { issuerAccountId, recipientAccountId, amount });
      this.showMint = false;
    },
    openBurnModal(token) {
      this.selectedToken = token;
      this.showBurn = true;
    },
    sendBurnRequest({ tokenId, redemptionAccountId, amount }) {
      burnToken(tokenId, { redemptionAccountId, amount });
      this.showBurn = false;
    }
  }
};
</script>

<template>
  <div>
    <h3 class="mb-4 text-info">Token Management</h3>

    <!-- Toggle Import/Create Form -->
    <div v-if="!showCreateForm && !showImportForm" class="d-flex justify-content-end mb-3 gap-2">
      <button v-if="!showImportForm" class="btn btn-outline-warning px-4" type="button" @click="showImportForm = !showImportForm">
        Import
      </button>
      <button v-if="!showCreateForm" class="btn btn-outline-primary px-4" type="button" @click="showCreateForm = !showCreateForm; this.fetchAccounts();">
        Create New Token
      </button>
    </div>

    <!-- Import Token Form -->
    <form v-if="showImportForm" @submit.prevent="importToken" class="mb-4">
      <div class="mb-3">
        <input
            v-model="importTokenAddress"
            class="form-control bg-dark border-info text-white"
            placeholder="Token hex address 0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            @input=""
        />
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger"
            type="button"
            @click="showImportForm = false"
        >
          Cancel
        </button>
        <button class="btn btn-outline-primary" type="submit">
          Import Token
        </button>
      </div>
    </form>

    <!-- Create Token Form -->
    <form v-if="showCreateForm" @submit.prevent="createToken" class="mb-4">
      <input v-model="newToken.name" class="form-control bg-dark text-white border-info mb-2"
             placeholder="Token Name"
             required/>
      <input v-model="newToken.symbol" class="form-control bg-dark text-white border-info mb-2"
             placeholder="Symbol"
             required/>

      <div class="mb-3">
        <select v-model="newToken.accountId" class="form-select bg-dark border-info" required>
          <option disabled value="">-- owner account --</option>
          <option v-for="acc in accounts" :key="acc.ref" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger"
            type="button"
            @click="showCreateForm = false"
        >
          Cancel
        </button>
        <button class="btn btn-outline-primary" type="submit">
          Create Token
        </button>
      </div>
    </form>

    <!-- Token Cards -->
    <div v-if="tokens && tokens.length > 0" class="row mt-4 g-3">
      <div v-for="token in tokens" :key="token.id" class="col-12">
        <div v-if="token.symbol !== 'ETH'" class="card bg-dark text-white border border-info shadow-sm p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <div class="mb-1">
                <div class="h5 mb-0">
                  <span class="text-info">{{ token.name }}</span> <span class="">({{ token.symbol }})</span>
                </div>
              </div>
              <div v-if="token.own === false && token.counterparty" class="mb-2 me-2">
                <span class="label text-secondary">Issuer Counterparty:</span>
                <span>{{ token.counterparty?.name }}</span>
              </div>
              <div class="">
              <span class="mono small">
                <a class="text-decoration-none me-2" :href="tokenLink(token.address)" target="_blank"
                   rel="noopener noreferrer">
                  {{ token.address }}
                </a>
                <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer text-info"
                   @click="copyAddress(token.address)"
                   title="Copy to clipboard">
                </i>
              </span>
              </div>
            </div>
            <div v-if="token.own" class="d-flex gap-2">
              <button class="btn btn-outline-danger px-4" type="button" @click="this.openBurnModal(token); this.fetchAccounts();">Burn</button>
              <button class="btn btn-outline-primary px-4" type="button" @click="this.openMintModal(token); this.fetchAccounts();">Mint</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="">No tokens created yet.</div>

    <BurnTokenModal
        :visible="showBurn"
        :accounts="accounts"
        :tokenId="selectedToken.id"
        @close="showBurn = false"
        @submit="sendBurnRequest"
    />
    <MintTokenModal
        :visible="showMint"
        :accounts="accounts"
        :tokenId="selectedToken.id"
        @close="showMint = false"
        @submit="sendMintRequest"
    />

  </div>
</template>

<style scoped>
input::placeholder,
select {
  color: #ccc;
}

input.form-control.bg-dark.text-white {
  color: #ffffff;
  border-color: #2af2ff;
}

input.form-control.bg-dark.text-white:focus {
  border-color: #2af2ff;
  box-shadow: 0 0 0 0.2rem rgba(42, 242, 255, 0.25);
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>