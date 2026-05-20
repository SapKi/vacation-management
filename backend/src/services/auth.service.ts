import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class AuthService {
  private get userRepo() {
    return AppDataSource.getRepository(User);
  }

  async login(name: string): Promise<User> {
    if (!name || !name.trim()) {
      throw { status: 400, message: "Name is required" };
    }
    const user = await this.userRepo.findOneBy({ name: name.trim() });
    if (!user) {
      throw { status: 401, message: "No account found with that name" };
    }
    return user;
  }

  async getAll(): Promise<User[]> {
    return this.userRepo.find({ order: { id: "ASC" } });
  }
}
