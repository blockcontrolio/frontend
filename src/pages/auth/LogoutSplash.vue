<script>
import {logout} from "../../auth/cognito.js";
import {clearStorage} from "../../auth/tokenService.js";
import {resetAllStores} from "../../js/stores/resetStores.js";

export default {
  name: "LogoutSplash",
  mounted() {
    clearStorage();
    resetAllStores();
    logout();
  }
}
</script>
