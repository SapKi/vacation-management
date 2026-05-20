import { UserRole } from "../entities/User";

export function validateLogin(name: string, password: string): void {
  if (!name?.trim() || !password)
    throw { status: 400, message: "Name and password are required" };
}

export function validateRegister(name: string, role: UserRole, password: string): void {
  if (!name?.trim())
    throw { status: 400, message: "Name is required" };
  if (!role)
    throw { status: 400, message: "Role is required" };
  if (!password || password.length < 4)
    throw { status: 400, message: "Password must be at least 4 characters" };
}
