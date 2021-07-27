import { createRouter, createWebHistory } from "vue-router";
import importQuestionnaire from "../views/Import.vue";

import store from "../store";

import EditorScreen from "../views/EditorScreen.vue";
import EditorQuestionnaire from "../views/EditorQuestionnaire.vue";

const routes = [
  {
    path: "/",
    name: "EditorScreen",
    component: EditorScreen,
  },
  {
    path: "/test",
    name: "EditorQuestionnaire",
    component: EditorQuestionnaire,
  },
  {
    path: "/import",
    name: "Import",
    component: importQuestionnaire,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

//[TO-DO]Desbloquear cuando haya terminado la funciondalidad del cuestionario
router.beforeEach((to, from, next) => {
  if (to.name !== "Import" && !store.getters.getNameofQuestionnaire)
    next({ name: "Import" });
  else next();
});
export default router;
