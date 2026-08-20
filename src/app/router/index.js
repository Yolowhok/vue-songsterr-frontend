import { createRouter, createWebHistory } from "vue-router";
import GeneralLayout from "@/app/ui/GeneralLayout.vue";
import { useCompositionStore } from "@/entities/composition";
import CompositionEditorPage from "@/pages/composition-editor/ui/CompositionEditorPage.vue";
import CompositionCreatePage from "@/pages/composition-create/ui/CompositionCreatePage.vue";
import CompositionListPage from "@/pages/composition-list/ui/CompositionListPage.vue";
import NotesheetCreatePage from "@/pages/notesheet-create/ui/NotesheetCreatePage.vue";

const routes = [
  {
    path: "/",
    component: GeneralLayout,
    name: "general",
    children: [
      {
        path: "composition/:id/notesheet/:num",
        name: "home",
        component: CompositionEditorPage,
      },
      {
        path: "/",
        name: "list",
        components: {
          modal: CompositionListPage,
        },
        meta: { requiresModal: true },
      },
      {
        path: "create/composition",
        name: "createComposition",
        components: {
          modal: CompositionCreatePage,
        },
        meta: { requiresModal: true },
      },
      {
        path: "composition/:id/create/notesheet",
        name: "NotesheetCreate",
        components: {
          modal: NotesheetCreatePage,
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
    const store = useCompositionStore();
    try {
      await store.fetchComposition(to.params.id);
    } catch (error) {
      console.error("Ошибка загрузки композиции", error);
    }
  }
  next();
});

export default router;
