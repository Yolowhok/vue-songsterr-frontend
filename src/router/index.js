import { createRouter, createWebHistory } from "vue-router";
import test from "../components/test.vue";
import App from "../App.vue";
import General from "../components/General.vue";
import { newStore } from "../store/notesheet-store";
import Composition from "../components/composition/Composition.vue";
import CompositionCreate from "../components/composition/CompositionCreate.vue";
import CompositionList from "../components/composition/CompositionList.vue";
import NotesheetCreate from "../components/notesheet/NotesheetCreate.vue";
const routes = [
  {
    path: "/",
    component: General,
    name: "general",
    children: [
      {
        path: "composition/:id/notesheet/:num",
        name: "home",
        component: Composition,
      },
      {
        path: "/",
        name: "list",
        components: {
          modal: CompositionList,
        },
        meta: { requiresModal: true },
      },
      {
        path: "create/composition",
        name: "createComposition",
        components: {
          modal: CompositionCreate,
        },
        meta: { requiresModal: true },
      },
      {
        path: "composition/:id/create/notesheet",
        name: "NotesheetCreate",
        components: {
          modal: NotesheetCreate,
        },
        meta: { requiresModal: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith("/composition/") && to.params.id !== from.params.id) {
    const store = newStore();
    try {
      await store.fetchComposition(to.params.id);
    } catch (error) {
      console.error("Ошибка загрузки композиции", error);
    }
  }
  next();
});

export default router;
