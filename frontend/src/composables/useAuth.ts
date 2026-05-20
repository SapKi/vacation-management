import { ref, computed } from "vue";
import { authService, type AuthUser } from "../services/auth";
import { UserRole } from "../constants";

const currentUser = ref<AuthUser | null>(authService.get());

export function useAuth() {
  const isLoggedIn  = computed(() => !!currentUser.value);
  const isRequester = computed(() => currentUser.value?.role === UserRole.REQUESTER);
  const isValidator = computed(() => currentUser.value?.role === UserRole.VALIDATOR);

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
