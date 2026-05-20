import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import RequesterPage from "../pages/RequesterPage.vue";
import ValidatorPage from "../pages/ValidatorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/requester", component: RequesterPage },
    { path: "/validator", component: ValidatorPage },
  ],
});

export default router;
