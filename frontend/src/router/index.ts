import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth";
import HomePage      from "../pages/HomePage.vue";
import LoginPage     from "../pages/LoginPage.vue";
import RequesterPage from "../pages/RequesterPage.vue";
import ValidatorPage from "../pages/ValidatorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/",          component: HomePage   },
    { path: "/login",     component: LoginPage  },
    { path: "/requester", component: RequesterPage, meta: { requiresAuth: true, role: "Requester" } },
    { path: "/validator", component: ValidatorPage, meta: { requiresAuth: true, role: "Validator" } },
  ],
});

router.beforeEach((to: RouteLocationNormalized) => {
  const user = authService.get();

  // Redirect logged-in users away from landing / login to their role page
  if ((to.path === "/" || to.path === "/login") && user) {
    return user.role === "Requester" ? "/requester" : "/validator";
  }

  // Protect role-specific pages
  if (to.meta.requiresAuth) {
    if (!user) return "/login";
    if (to.meta.role && user.role !== to.meta.role) {
      // Wrong role — send them to the correct page
      return user.role === "Requester" ? "/requester" : "/validator";
    }
  }
});

export default router;
