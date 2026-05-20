import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth";
import HomePage      from "../pages/HomePage.vue";
import LoginPage     from "../pages/LoginPage.vue";
import SignUpPage    from "../pages/SignUpPage.vue";
import RequesterPage from "../pages/RequesterPage.vue";
import ValidatorPage from "../pages/ValidatorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/",          component: HomePage   },                                                          // always accessible
    { path: "/login",     component: LoginPage  },                                                          // always accessible
    { path: "/signup",    component: SignUpPage  },                                                         // always accessible
    { path: "/requester", component: RequesterPage, meta: { requiresAuth: true, role: "Requester" } },
    { path: "/validator", component: ValidatorPage, meta: { requiresAuth: true, role: "Validator" } },
  ],
});

router.beforeEach((to: RouteLocationNormalized) => {
  const user = authService.get();

  // Protect role-specific pages
  if (to.meta.requiresAuth) {
    if (!user) return "/login";
    if (to.meta.role && user.role !== to.meta.role) {
      // Wrong role — redirect to the user's own page
      return user.role === "Requester" ? "/requester" : "/validator";
    }
  }
});

export default router;
