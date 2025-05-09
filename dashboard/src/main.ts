// Plugins
import { registerPlugins } from "@/plugins";
import naive from "naive-ui";

// Components
import App from "@/App.vue";

// Utils
import Api from "@/api";
import * as storage from "@/utils/storage";
import * as validators from "@/utils/validators";
import * as events from "@/utils/events";
import router from "@/router";
import Utils from "@/utils/utils";

import "@/styles/settings.css";

// Composables
import { createApp } from "vue";

const app = createApp(App);
const api = new Api(router);

app.provide("$api", api);
app.provide("$storage", storage);
app.provide("$validators", validators);
app.provide("$events", events);
app.provide("$utils", new Utils(router));

registerPlugins(app);

app.use(naive);
app.mount("#app");
