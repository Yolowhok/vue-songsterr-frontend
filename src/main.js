import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router"; // подключаем роутер

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // подключаем Pinia

app.use(router);

async function init() {
  app.mount("#app");
}

init();
