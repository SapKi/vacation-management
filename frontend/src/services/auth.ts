import api from "./api";
import { UserRole } from "../constants";
import { IStorage } from "../storage/IStorage";
import { LocalStorageAdapter } from "../storage/LocalStorage";

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

export function createAuthService(storage: IStorage = new LocalStorageAdapter()) {
  return {
    login(name: string, password: string) {
      return api.post<AuthUser>("/auth/login", { name, password });
    },

    register(payload: RegisterPayload) {
      return api.post<AuthUser>("/auth/register", payload);
    },

    save(user: AuthUser): void {
      storage.set(STORAGE_KEY, user);
    },

    get(): AuthUser | null {
      return storage.get<AuthUser>(STORAGE_KEY);
    },

    clear(): void {
      storage.remove(STORAGE_KEY);
    },

    isLoggedIn(): boolean {
      return storage.has(STORAGE_KEY);
    },
  };
}

export const authService = createAuthService();
