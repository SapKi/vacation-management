import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth";
import { ROUTES, roleToRoute } from "../constants";
import HomePage      from "../pages/HomePage.vue";
import LoginPage     from "../pages/LoginPage.vue";
import SignUpPage    from "../pages/SignUpPage.vue";
import RequesterPage from "../pages/RequesterPage.vue";
import ValidatorPage from "../pages/ValidatorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: ROUTES.HOME,      component: HomePage   },
    { path: ROUTES.LOGIN,     component: LoginPage  },
    { path: ROUTES.SIGNUP,    component: SignUpPage  },
    { path: ROUTES.REQUESTER, component: RequesterPage, meta: { requiresAuth: true, role: "Requester" } },
    { path: ROUTES.VALIDATOR, component: ValidatorPage, meta: { requiresAuth: true, role: "Validator" } },
  ],
});

router.beforeEach((to: RouteLocationNormalized) => {
  const user = authService.get();

  if (to.meta.requiresAuth) {
    if (!user) return ROUTES.LOGIN;
    if (to.meta.role && user.role !== to.meta.role) {
      return roleToRoute(user.role);
    }
  }
});

export default router;
