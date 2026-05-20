import { ref, computed } from "vue";
import { authService, type AuthUser } from "../services/auth";

// Module-level ref — shared singleton across all components
const currentUser = ref<AuthUser | null>(authService.get());

export function useAuth() {
  const isLoggedIn  = computed(() => !!currentUser.value);
  const isRequester = computed(() => currentUser.value?.role === "Requester");
  const isValidator = computed(() => currentUser.value?.role === "Validator");

  function setUser(user: AuthUser) {
    authService.save(user);
    currentUser.value = user;
  }

  function logout() {
    authService.clear();
    currentUser.value = null;
  }

  return { currentUser, isLoggedIn, isRequester, isValidator, setUser, logout };
}
