import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { Quasar, Loading, Notify } from "quasar";
import quasarUserOptions from "./quasar-user-options";
import i18n from "./i18n";

createApp(App)
  .use(i18n)
  .use(
    Quasar,
    {
      plugins: {
        Loading,
        Notify,
      },
      config: {
        loading: {
          /* look at QuasarConfOptions from the API card */
        },
        notify: {
          /* look at QuasarConfOptions from the API card */
        },
      },
    },
    quasarUserOptions,
  )
  .use(store)
  .use(router)
  .mount("#app");
