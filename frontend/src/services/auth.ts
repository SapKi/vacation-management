import api from "./api";

export interface AuthUser {
  id: number;
  name: string;
  role: "Requester" | "Validator";
}

const STORAGE_KEY = "vm_user";

export const authService = {
  /** Call the backend to authenticate and return the user. */
  login(name: string) {
    return api.post<AuthUser>("/auth/login", { name });
  },

  /** Fetch all available demo accounts from the backend. */
  getAccounts() {
    return api.get<AuthUser[]>("/auth/accounts");
  },

  /** Persist the authenticated user in localStorage. */
  save(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  /** Return the stored user, or null if not logged in. */
  get(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  /** Remove the stored user (logout). */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
