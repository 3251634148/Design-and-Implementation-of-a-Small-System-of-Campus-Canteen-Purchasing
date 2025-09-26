import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsString, IsEnum, Length } from "class-validator";
import { User } from "./User";
import { Order } from "./Order";

export enum ComplaintStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

@Entity("complaints")
@Index(["complainant_id"])
@Index(["complained_id"])
@Index(["order_id"])
@Index(["status"])
@Index(["created_at"])
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  complainant_id: number;

  @Column({ type: "int" })
  complained_id: number;

  @Column({ type: "int", nullable: true })
  order_id?: number;

  @Column({ type: "varchar", length: 50 })
  @IsString()
  @Length(1, 50)
  category: string;

  @Column({ type: "text" })
  @IsString()
  reason: string;

  @Column({
    type: "enum",
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @Column({ type: "text", nullable: true })
  @IsString()
  admin_response?: string;

  @Column({ type: "int", nullable: true })
  processed_by?: number;

  @Column({ type: "timestamp", nullable: true })
  processed_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(
    () => User,
    (user) => user.filed_complaints
  )
  @JoinColumn({ name: "complainant_id" })
  complainant: User;

  @ManyToOne(
    () => User,
    (user) => user.received_complaints
  )
  @JoinColumn({ name: "complained_id" })
  complained: User;

  @ManyToOne(
    () => Order,
    (order) => order.complaints
  )
  @JoinColumn({ name: "order_id" })
  order?: Order;

  @ManyToOne(
    () => User,
    (user) => user.processed_complaints
  )
  @JoinColumn({ name: "processed_by" })
  processed_by_user?: User;
}
