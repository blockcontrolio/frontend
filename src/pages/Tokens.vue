<script>
import {fetchAccounts} from "../services/accounts-api.js";
import {
  addToken,
  block,
  burnToken,
  createToken,
  fetchTokens,
  freeze,
  grantRole,
  importToken,
  mintToken,
  pause,
  revokeRole,
  unblock,
  unpause
} from "../services/tokens-api.js";
import {fetchAcceptedPartnerships} from "../services/partnership-api.js"
import {formatAmount} from "../js/utils.js";
import TokenImport from "../components/token/TokenImport.vue";
import TokenCreate from "../components/token/TokenCreate.vue";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";
import MintTokenModal from "../components/modal/MintTokenModal.vue";
import BurnTokenModal from "../components/modal/BurnTokenModal.vue"
import PauseTokenModal from "../components/modal/PauseTokenModal.vue"
import FreezeTokenModal from "../components/modal/FreezeTokenModal.vue";
import BlockTokenModal from "../components/modal/BlockTokenModal.vue";
import TxToast from "../components/toast/SuccessToast.vue";
import ErrorToast from "../components/toast/ErrorToast.vue";
import RolesModal from "../components/modal/RolesModal.vue";
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import TokenAdd from "../components/token/TokenAdd.vue";

export default {
  name: 'Tokens',
  components: {
    TokenAdd,
    TokenCreate,
    TokenImport,
    RolesModal,
    MintTokenModal,
    BurnTokenModal,
    PauseTokenModal,
    FreezeTokenModal,
    BlockTokenModal,
    AddrScanLink,
    TxToast,
    ErrorToast
  },
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  data() {
    return {
      tokens: [],
      accounts: [],
      partnerships: [],
      showTokenForm: null, // import, create
      selectedToken: null,
      txSuccess: null,
      txError: null,
      operations: ['mint', 'burn', 'pause', 'unpause', 'freeze', 'block', 'unblock'],
      roleActions: ['grant', 'revoke'],
      modalType: ''
    };
  },
  mounted() {
    this.fetchAccounts();
    this.fetchTokens();
    let networkId = useNetworkStore().selectedNetwork.id;
    const loggedInCounterpartyId = useCounterpartyStore().counterparty.id;
    this.fetchAcceptedPartnerships(networkId, loggedInCounterpartyId);
  },
  methods: {
    formatAmount,
    isOwnToken(token) {
      if (token.issuerCounterparty) {
        return useCounterpartyStore().counterparty.id === token.issuerCounterparty?.id;
      }
      return false;
    },
    async fetchAcceptedPartnerships(networkId, counterpartyId) {
      this.partnerships = await fetchAcceptedPartnerships(networkId, counterpartyId);
    },
    async fetchTokens() {
      const res = await fetchTokens();
      this.tokens = await res.json();
    },
    async fetchAccounts() {
      const res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async importToken(address) {
      if (address === undefined || address === null || address === '') {
        throw new Error('Address must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return importToken({address});
      }, () => {
        this.showTokenForm = null;
        return `Token has been imported`;
      });
    },
    async addToken(id) {
      if (id === undefined || id === null || id === '') {
        throw new Error('Id must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        this.showTokenForm = null;
        return addToken({id});
      }, () => {
        return `Counterparty token has been imported`;
      });
    },
    async createToken(newToken) {
      if ([newToken.name, newToken.symbol, newToken.deployerAccountId]
          .some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (name, symbol, deployerAccountId) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return createToken(newToken);
      }, () => {
        this.showTokenForm = null;
        return `Token ${(newToken.symbol)} has been created`;
      });
    },
    openModal(token, modalType) {
      this.validateModalType(modalType);
      this.selectedToken = token;
      this.modalType = modalType;
    },
    validateModalType(modalType) {
      let ok = this.operations.find(m => m === modalType) || this.roleActions.find(m => m === modalType);
      if (!ok) {
        alert('Invalid modal type')
      }
    },
    // all requests
    async sendMintRequest({tokenId, minterAccountId, recipientAccountId, amount}) {
      if ([tokenId, minterAccountId, recipientAccountId, amount].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, minterAccountId, recipientAccountId, amount) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return mintToken(tokenId, {minterAccountId, recipientAccountId, amount});
      }, () => {
        return `Token ${this.selectedToken?.symbol} minted with amount ${amount}`;
      });
    },
    async sendBurnRequest({tokenId, burnerAccountId, amount}) {
      if ([tokenId, burnerAccountId, amount].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, burnerAccountId, amount) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return burnToken(tokenId, {burnerAccountId, amount});
      }, () => {
        return `Token ${this.selectedToken?.symbol} burned with amount ${amount}`;
      });
    },
    async sendPauseRequest({tokenId, pauserAccountId}) {
      if ([tokenId, pauserAccountId].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, pauserAccountId) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return pause(tokenId, pauserAccountId);
      }, () => {
        return `Token ${this.selectedToken?.symbol} paused for all operations`;
      });
    },
    async sendUnpauseRequest({tokenId, pauserAccountId}) {
      if ([tokenId, pauserAccountId].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, pauserAccountId) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return unpause(tokenId, pauserAccountId);
      }, () => {
        return `Token ${this.selectedToken?.symbol} unpaused for all operations`;
      });
    },
    async sendFreezeRequest({tokenId, custodianAccountId, address, amount}) {
      if ([tokenId, custodianAccountId, address, amount].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, custodianAccountId, address, amount) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return freeze(tokenId, {custodianAccountId, address, amount});
      }, () => {
        return `Token ${this.selectedToken?.symbol} freeze done with amount ${amount}`;
      });
    },
    async sendBlockAddressRequest({tokenId, limiterAccountId, address}) {
      if ([tokenId, limiterAccountId, address].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, limiterAccountId, address) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return block(tokenId, {limiterAccountId, address});
      }, () => {
        return `Token ${this.selectedToken?.symbol} blocked for the address`;
      });
    },
    async sendUnblockAddressRequest({tokenId, limiterAccountId, address}) {
      if ([tokenId, limiterAccountId, address].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, limiterAccountId, address) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return unblock(tokenId, {limiterAccountId, address});
      }, () => {
        return `Token ${this.selectedToken?.symbol} unblocked for the address`;
      });
    },
    async sendGrantRoleRequest({tokenId, adminAccountId, targetAccountId, role}) {
      if ([tokenId, adminAccountId, targetAccountId, role].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, adminAccountId, targetAccountId, role) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return grantRole(tokenId, {adminAccountId, targetAccountId, role});
      }, () => {
        return `Role granted`;
      });
    },
    async sendRevokeRoleRequest({tokenId, adminAccountId, targetAccountId, role}) {
      if ([tokenId, adminAccountId, targetAccountId, role].some(value => value === undefined || value === null || value === '')) {
        throw new Error('All parameters (tokenId, adminAccountId, targetAccountId, role) must be defined and non-empty.');
      }
      await this.handleRequest(() => {
        return revokeRole(tokenId, {adminAccountId, targetAccountId, role});
      }, () => {
        return `Role revoked`;
      });
    },
    // base request
    async handleRequest(operation, onSuccess) {
      try {
        let response = await operation();
        if (response.ok) {
          let message = onSuccess();
          this.txSuccess = {...(await response.json()), message}; // transactionId + message
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
        message: err.message || 'Unknown error occurred.'
      };
    },
    handleUnknownError(err) {
      console.error(err)
      this.txSuccess = null;
      this.txError = {
        error: 'Network Error',
        message: err.message
      };
    },
  },
  computed: {
    canCreate() {
      return this.counterpartyStore.counterparty?.type === 'EMI' && this.accounts.some((item) => item.type === 'ADMIN');
    },
    canImport() {
      return this.accounts.some((item) => item.type === 'ADMIN');
    },
  }
};
</script>

<template>
  <h3 class="bold p-2 pt-3">Token Management</h3>

  <div class="p-2 mt-3">
    <!-- toggle import/create form -->
    <div v-if="!this.showTokenForm" class="d-flex justify-content-end mb-3 gap-2">
      <button v-if="canImport" class="btn btn-outline-warning btn-sm px-4" type="button" @click="this.showTokenForm = 'import';">
        Import Token
      </button>
      <button v-if="canImport && partnerships.length" class="btn btn-outline-warning btn-sm px-4" type="button"
              @click="this.showTokenForm = 'add';">
        Add Counterparty Token
      </button>
      <button v-if="canCreate" class="btn btn-outline-primary btn-sm px-4" type="button"
              @click="this.showTokenForm = 'create'">
        Create Token
      </button>
    </div>

    <TokenAdd v-if="showTokenForm === 'add'"
              :partnerships="partnerships"
              @add="addToken"
              @cancel="showTokenForm = null"
    />
    <TokenCreate v-if="showTokenForm === 'create'"
                 :accounts="accounts"
                 @create="createToken"
                 @cancel="showTokenForm = null"
    />
    <TokenImport v-if="showTokenForm === 'import'"
                 @import="importToken"
                 @cancel="showTokenForm = null"
    />

    <!-- tokens list -->
    <div v-if="tokens && tokens.length > 0" class="row mt-4 g-3">
      <div v-for="token in tokens" :key="token.id">
        <div v-if="token.symbol !== 'ETH'" class="card border p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <div class="mb-1">
                <div class="h5 mb-0">
                  <span class="me-2">{{ token.name }}</span><span class="">({{ token.symbol }})</span>
                </div>
              </div>
              <div v-if="isOwnToken(token)" class="mb-1">
                <span class="label text-secondary me-2">Total Supply:</span>
                <span>{{ formatAmount(token?.totalSupply) }}</span>
              </div>
              <div v-if="token.issuerCounterparty" class="mb-1">
                <span class="label text-secondary me-2">Issuer Counterparty:</span>
                <span>{{ token.issuerCounterparty.name }}</span>
              </div>
              <addr-scan-link :type="'token'" :address="token.address"></addr-scan-link>
            </div>
            <!-- Token Operations -->
            <div v-if="isOwnToken(token)" class="d-flex gap-2">
              <!--roles dropdown-->
              <div class="dropdown ms-auto">
                <button
                    class="btn btn-outline-secondary btn-sm dropdown-toggle px-4"
                    type="button"
                    data-bs-toggle="dropdown"
                >
                  Roles
                </button>
                <ul class="dropdown-menu border">
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'grant')"
                    >
                      Grant
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'revoke')"
                    >
                      Revoke
                    </a>
                  </li>
                </ul>
              </div>
              <!--actions dropdown-->
              <div class="dropdown ms-auto">
                <button
                    class="btn btn-outline-secondary btn-sm dropdown-toggle px-4"
                    type="button"
                    data-bs-toggle="dropdown"
                >
                  Manage
                </button>
                <ul class="dropdown-menu border">
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'mint')"
                    >
                      Mint
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       :class="{ disabled: !token.totalSupply }"
                       @click.prevent="openModal(token, 'burn')"
                    >
                      Burn
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'pause')"
                    >
                      Pause
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'unpause')"
                    >
                      Unpause
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'freeze')"
                    >
                      Freeze
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'block')"
                    >
                      Block
                    </a>
                  </li>
                  <li>
                    <a href="#" class="dropdown-item"
                       @click.prevent="openModal(token, 'unblock')"
                    >
                      Unblock
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center">No tokens created yet. Admin account required to create a token.</div>

    <BurnTokenModal v-if="this.modalType === 'burn' && this.selectedToken"
                    :accounts="this.accounts"
                    :tokenId="this.selectedToken?.id"
                    @close="this.modalType = ''"
                    @submit="sendBurnRequest"
    />
    <MintTokenModal v-if="this.modalType === 'mint' && this.selectedToken"
                    :accounts="this.accounts"
                    :tokenId="this.selectedToken?.id"
                    @close="this.modalType = ''"
                    @submit="sendMintRequest"
    />
    <PauseTokenModal v-if="this.modalType === 'pause' && this.selectedToken"
                     :modalType="'pause'"
                     :accounts="this.accounts"
                     :tokenId="this.selectedToken?.id"
                     @close="this.modalType = ''"
                     @submit="sendPauseRequest"
    />
    <PauseTokenModal v-if="this.modalType === 'unpause' && this.selectedToken"
                     :modalType="'unpause'"
                     :accounts="this.accounts"
                     :tokenId="this.selectedToken?.id"
                     @close="this.modalType = ''"
                     @submit="sendUnpauseRequest"
    />
    <FreezeTokenModal v-if="this.modalType === 'freeze' && this.selectedToken"
                      :accounts="this.accounts"
                      :token="this.selectedToken"
                      @close="this.modalType = ''"
                      @submit="sendFreezeRequest"
    />
    <BlockTokenModal v-if="this.modalType === 'block' && this.selectedToken"
                     :modalType="'block'"
                     :accounts="this.accounts"
                     :token="this.selectedToken"
                     @close="this.modalType = ''"
                     @submit="sendBlockAddressRequest"
    />
    <BlockTokenModal v-if="this.modalType === 'unblock' && this.selectedToken"
                     :modalType="'unblock'"
                     :accounts="this.accounts"
                     :token="this.selectedToken"
                     @close="this.modalType = ''"
                     @submit="sendUnblockAddressRequest"
    />
    <RolesModal v-if="this.modalType === 'grant' && this.selectedToken"
                :modalType="'grant'"
                :accounts="this.accounts"
                :tokenId="this.selectedToken?.id"
                @close="this.modalType = ''"
                @submit="sendGrantRoleRequest"
    />
    <RolesModal v-if="this.modalType === 'revoke' && this.selectedToken"
                :modalType="'revoke'"
                :accounts="this.accounts"
                :tokenId="this.selectedToken?.id"
                @close="this.modalType = ''"
                @submit="sendRevokeRoleRequest"
    />

    <TxToast
        v-if="txSuccess"
        :success="txSuccess"
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

.label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>