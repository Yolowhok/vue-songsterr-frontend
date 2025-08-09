import { createRouter, createWebHistory } from "vue-router";

import test from "../components/test.vue";
import App from "../App.vue";
import General from "../components/General.vue";
import { newStore } from "../store/notesheet-store";
import Composition from "../components/composition/Composition.vue";

const routes = [
  {
    path: "/",
    component: General,
    name: "general",
    children: [
      // Основной маршрут
      {
        path: "composition/:id/notesheet/:num",
        name: "home",
        component: Composition, // Прямой импорт
      },
      // Модальные маршруты
      {
        path: "",
        name: "list",
        components: {
          modal: () => import("../components/composition/CompositionList.vue"), // Модальный компонент
        },
        meta: { requiresModal: true },
      },
      {
        path: "create/composition",
        name: "createComposition",
        components: {
          modal: () => import("../components/test.vue"),
        },
        meta: { requiresModal: true },
      },
      {
        path: "composition/:id/notesheetList",
        name: "test",
        components: {
          modal: () => import("../components/test.vue"),
        },
        meta: { requiresModal: true },
      },
    ],
  },
];

// const routes = [
//   {
//     path: "/compositions",
//     name: "compositions",
//     component: test,
//   },
//   {
//     path: "/create/composition",
//     name: "createComposition",
//     component: test,
//   },
// ];

const router = createRouter({
  history: createWebHistory(), // режим history вместо hash
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith("/composition/") && to.params.id !== from.params.id) {
    const store = newStore();
    try {
      await store.fetchComposition(to.params.id);
      // другие загрузки данных
    } catch (error) {
      console.error("Ошибка загрузки композиции", error);
    }
  }
  next();
});

export default router;
