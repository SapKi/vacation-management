import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { IUserRepository } from "../IUserRepository";
import { TypeOrmBaseRepository } from "./TypeOrmBaseRepository";

export class TypeOrmUserRepository
  extends TypeOrmBaseRepository<User>
  implements IUserRepository {

  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findByNameWithPassword(name: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder("u")
      .addSelect("u.password_hash")
      .where("u.name = :name", { name: name.trim() })
      .getOne();
  }

  async existsByName(name: string): Promise<boolean> {
    return !!(await this.repo.findOneBy({ name: name.trim() }));
  }
}
