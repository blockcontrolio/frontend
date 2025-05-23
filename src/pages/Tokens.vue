<script>
import {createToken, fetchAccounts, fetchTokens} from "../services/api.js";
import {mintToken, burnToken, importToken, pause, unpause} from "../services/tokens-api.js";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";
import MintTokenModal from "../components/modal/MintTokenModal.vue";
import BurnTokenModal from "../components/modal/BurnTokenModal.vue"
import PauseTokenModal from "../components/modal/PauseTokenModal.vue"
import {formatAmount} from "../js/utils.js";
import TxToast from "../components/toast/TxToast.vue";
import ErrorToast from "../components/toast/ErrorToast.vue";

export default {
  name: 'Tokens',
  components: {
    MintTokenModal,
    BurnTokenModal,
    PauseTokenModal,
    AddrScanLink,
    TxToast,
    ErrorToast
  },
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
      selectedToken: {},
      txSuccess: null,
      txError: null,
      actions: ['Mint', 'Burn', 'Pause', 'Unpause', 'Freeze', 'Block', 'Unblock'],
      modalType: ''
    };
  },
  mounted() {
    this.fetchTokens();
  },
  methods: {
    formatAmount,
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
        alert(`Error: ${err.message}`); // todo show toast
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
    // mint
    openMintModal(token) {
      this.selectedToken = token;
      this.showMint = true;
    },
    async sendMintRequest({tokenId, issuerAccountId, recipientAccountId, amount}) {
      try {
        let response = await mintToken(tokenId, {issuerAccountId, recipientAccountId, amount});
        if (response.ok) {
          let message = `Token ${this.selectedToken?.symbol} minted with amount ${amount}`
          this.txSuccess = {...(await response.json()), message};
        } else {
          const err = await response.json();
          this.txError = {
            error: err.error || 'Error',
            message: err.message || 'Something went wrong'
          };
        }
      } catch (err) {
        this.txSuccess = null;
        console.error(err)
        this.txError = {
          error: 'Network Error',
          message: err.message
        };
      }
      this.showMint = false;
    },
    // burn
    openBurnModal(token) {
      this.selectedToken = token;
      this.showBurn = true;
    },
    async sendBurnRequest({tokenId, redemptionAccountId, amount}) {
      try {
        let response = await burnToken(tokenId, {redemptionAccountId, amount});
        if (response.ok) {
          let message = `Token ${this.selectedToken?.symbol} burned with amount ${amount}`
          this.txSuccess = {...(await response.json()), message};
        } else {
          const err = await response.json();
          this.txError = {
            error: err.error || 'Error',
            message: err.message || 'Something went wrong'
          };
        }
      } catch (err) {
        this.txSuccess = null;
        console.error(err)
        this.txError = {
          error: 'Network Error',
          message: err.message
        };
      }
      this.showBurn = false;
    },
    // pause
    openPauseModal(token) {
      this.selectedToken = token;
      this.modalType = 'pause';
    },
    async sendPauseRequest({tokenId, pauserAccountId}) {
      await this.handleRequest(() => {
        return pause(tokenId, pauserAccountId);
      }, (response) => {
        let message = `Token ${this.selectedToken?.symbol} paused for all operations`
        this.txSuccess = {...(response.json()), message};
      });
    },
    // unpause
    openUnpauseModal(token) {
      this.selectedToken = token;
      this.modalType = 'unpause';
    },
    async sendUnpauseRequest({tokenId, pauserAccountId}) {
      await this.handleRequest(() => {
        return unpause(tokenId, pauserAccountId);
      }, (response) => {
        let message = `Token ${this.selectedToken?.symbol} unpaused for all operations`
        this.txSuccess = {...(response.json()), message};
      });
    },
    async handleRequest(operation, okCallback) {
      try {
        let response = await operation();
        if (response.ok) {
          await okCallback()
        } else {
          const err = await response.json();
          this.handleTxError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
      this.modalType = '';
    },
    handleTxError(err) {
      this.txSuccess = null;
      this.txError = {
        error: err.error || 'Error',
        message: err.message || 'Something went wrong'
      };
    },
    handleUnknownError(err) {
      console.error(err)
      this.txSuccess = null;
      this.transferError = {
        error: 'Network Error',
        message: err.message
      };
    }
  }
};
</script>

<template>
  <div>
    <h3 class="mb-4 text-info">Token Management</h3>

    <!-- Toggle Import/Create Form -->
    <div v-if="!showCreateForm && !showImportForm" class="d-flex justify-content-end mb-3 gap-2">
      <button v-if="!showImportForm" class="btn btn-outline-warning px-4" type="button"
              @click="showImportForm = !showImportForm">
        Import
      </button>
      <button v-if="!showCreateForm" class="btn btn-outline-primary px-4" type="button"
              @click="showCreateForm = !showCreateForm; this.fetchAccounts();">
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
      <div v-for="token in tokens" :key="token.id">
        <div v-if="token.symbol !== 'ETH'" class="card bg-dark text-white border border-info shadow-sm p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <div class="mb-1">
                <div class="h5 mb-0">
                  <span class="text-info me-2">{{ token.name }}</span><span class="">({{ token.symbol }})</span>
                </div>
              </div>
              <div v-if="token.own && token.totalSupply" class="mb-1">
                  <span class="label text-secondary me-2">Total Supply:</span>
                  <span>{{ formatAmount(token.totalSupply) }}</span>
              </div>
              <div v-if="token.own === false && token.counterparty" class="mb-1">
                <span class="label text-secondary me-2">Issuer Counterparty:</span>
                <span>{{ token.counterparty?.name }}</span>
              </div>
              <addr-scan-link :type="'token'" :address="token.address"></addr-scan-link>
            </div>
            <div v-if="token.own" class="d-flex gap-2">
              <div v-if="token.own" class="dropdown ms-auto">
                <button
                    class="btn btn-outline-primary dropdown-toggle px-4"
                    type="button"
                    data-bs-toggle="dropdown"
                >
                  Manage
                </button>
                <ul class="dropdown-menu bg-dark text-white border border-info">
                  <li>
                    <a href="#" class="dropdown-item text-primary btn-outline-primary"
                       @click.prevent="openMintModal(token); fetchAccounts();"
                    >
                      🪙 Mint
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item text-danger"
                       :class="{ disabled: !token.totalSupply }"
                       @click.prevent="openBurnModal(token); fetchAccounts();"
                    >
                      🔥 Burn
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item text-warning"
                       @click.prevent="openPauseModal(token); fetchAccounts();"
                    >
                      Pause
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item text-warning"
                       @click.prevent="openUnpauseModal(token); fetchAccounts();"
                    >
                      Unpause
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="">No tokens created yet.</div>

    <BurnTokenModal v-if="selectedToken"
        :visible="showBurn"
        :accounts="accounts"
        :tokenId="selectedToken?.id"
        @close="showBurn = false"
        @submit="sendBurnRequest"
    />
    <MintTokenModal v-if="selectedToken"
        :visible="showMint"
        :accounts="accounts"
        :tokenId="selectedToken?.id"
        @close="showMint = false"
        @submit="sendMintRequest"
    />
    <PauseTokenModal v-if="selectedToken"
                     :modalType="'pause'"
                     :visible="this.modalType === 'pause'"
                     :accounts="accounts"
                     :tokenId="selectedToken?.id"
                     @close="this.modalType = ''"
                     @submit="sendPauseRequest"
    />
    <PauseTokenModal v-if="selectedToken"
                     :modalType="'unpause'"
                     :visible="this.modalType === 'unpause'"
                     :accounts="accounts"
                     :tokenId="selectedToken?.id"
                     @close="this.modalType = ''"
                     @submit="sendUnpauseRequest"
    />

    <TxToast
        v-if="txSuccess"
        :txData="txSuccess"
        @closed="txSuccess = null; selectedToken = null"
    />
    <ErrorToast
        v-if="txError"
        :error="txError"
        @closed="txError = null; selectedToken = null"
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