import { createRouter, createWebHistory } from "vue-router";

import test from "../components/test.vue";
import App from "../App.vue";
import General from "../components/General.vue";

const routes = [
  {
    path: "/",
    component: General,
    children: [
      // Основной маршрут
      {
        path: "composition/:id/notesheet/:num",
        name: "home",
        component: () => import("../components/composition/Composition.vue"), // Создайте этот файл
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

export default router;
