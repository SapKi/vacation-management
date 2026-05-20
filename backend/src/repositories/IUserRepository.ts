import { User } from "../entities/User";
import { IRepository } from "./IRepository";

export interface IUserRepository extends IRepository<User> {
  findAll(): Promise<User[]>;
  findByNameWithPassword(name: string): Promise<User | null>;
  existsByName(name: string): Promise<boolean>;
}
