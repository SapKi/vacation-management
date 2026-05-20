import * as bcrypt from "bcryptjs";
import { UserRole } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";
import { validateLogin, validateRegister } from "../validators/auth.validator";

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async login(name: string, password: string) {
    validateLogin(name, password);

    const user = await this.userRepo.findByNameWithPassword(name);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw { status: 401, message: "Invalid name or password" };
    }

    const { password_hash: _, ...safe } = user;
    return safe;
  }

  async register(name: string, role: UserRole, password: string) {
    validateRegister(name, role, password);

    if (await this.userRepo.existsByName(name)) {
      throw { status: 409, message: "An account with that name already exists" };
    }

    const user = this.userRepo.create({
      name: name.trim(),
      role,
      password_hash: await bcrypt.hash(password, 10),
    });

    const saved = await this.userRepo.save(user);
    const { password_hash: _, ...safe } = saved;
    return safe;
  }
}
