import { DataSource, DeepPartial, EntityTarget, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { IRepository } from "../IRepository";

export abstract class TypeOrmBaseRepository<T extends ObjectLiteral, ID = number>
  implements IRepository<T, ID> {

  constructor(
    protected readonly dataSource: DataSource,
    private readonly entityClass: EntityTarget<T>,
  ) {}

  protected get repo(): Repository<T> {
    return this.dataSource.getRepository(this.entityClass);
  }

  async findById(id: ID): Promise<T | null> {
    return this.repo.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  async remove(entity: T): Promise<void> {
    await this.repo.remove(entity);
  }

  create(data: Partial<T>): T {
    return this.repo.create(data as DeepPartial<T>);
  }
}
