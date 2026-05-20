import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum RequestStatus {
  PENDING   = "Pending",
  APPROVED  = "Approved",
  REJECTED  = "Rejected",
  CANCELLED = "Cancelled",
}

@Entity("vacation_requests")
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: "date" })
  start_date: string;

  @Column({ type: "date" })
  end_date: string;

  @Column({ nullable: true, type: "text" })
  reason: string;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ nullable: true, type: "text" })
  comments: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.vacationRequests, { eager: false })
  @JoinColumn({ name: "user_id" })
  user: User;
}
