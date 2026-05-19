import { createRouter, createWebHistory } from "vue-router";
import RequesterPage from "../pages/RequesterPage.vue";
import ValidatorPage from "../pages/ValidatorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/requester" },
    { path: "/requester", component: RequesterPage },
    { path: "/validator", component: ValidatorPage },
  ],
});

export default router;
