export interface IRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  remove(entity: T): Promise<void>;
  create(data: Partial<T>): T;
}
