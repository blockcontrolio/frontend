<script>
import {externalLogin} from "../../auth/cognito.js";

export default {
  name: "LoginSplash",
  mounted() {
    externalLogin();
  }
}
</script>
