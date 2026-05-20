import api from "./api";
import { UserRole } from "../constants";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  role: UserRole;
  password: string;
}

const STORAGE_KEY = "vm_user";

export const authService = {
  login(name: string, password: string) {
    return api.post<AuthUser>("/auth/login", { name, password });
  },

  register(payload: RegisterPayload) {
    return api.post<AuthUser>("/auth/register", payload);
  },

  save(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  get(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
