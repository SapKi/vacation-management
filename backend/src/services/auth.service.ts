import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";

export class AuthService {
  private get repo() {
    return AppDataSource.getRepository(User);
  }

  async login(name: string, password: string): Promise<Omit<User, "password_hash">> {
    if (!name?.trim() || !password) {
      throw { status: 400, message: "Name and password are required" };
    }

    // password_hash is select:false — must be explicitly selected
    const user = await this.repo
      .createQueryBuilder("u")
      .addSelect("u.password_hash")
      .where("u.name = :name", { name: name.trim() })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw { status: 401, message: "Invalid name or password" };
    }

    const { password_hash: _, ...safe } = user;
    return safe;
  }

  async register(name: string, role: UserRole, password: string): Promise<Omit<User, "password_hash">> {
    if (!name?.trim())           throw { status: 400, message: "Name is required" };
    if (!role)                   throw { status: 400, message: "Role is required" };
    if (!password || password.length < 4)
      throw { status: 400, message: "Password must be at least 4 characters" };

    const existing = await this.repo.findOneBy({ name: name.trim() });
    if (existing)                throw { status: 409, message: "An account with that name already exists" };

    const user = this.repo.create({
      name: name.trim(),
      role,
      password_hash: await bcrypt.hash(password, 10),
    });

    const saved = await this.repo.save(user);
    const { password_hash: _, ...safe } = saved;
    return safe;
  }
}
