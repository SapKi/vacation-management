import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { VacationRequest } from "./VacationRequest";

export enum UserRole {
  REQUESTER = "Requester",
  VALIDATOR = "Validator",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.REQUESTER,
  })
  role: UserRole;

  @OneToMany(() => VacationRequest, (request) => request.user)
  vacationRequests: VacationRequest[];
}
