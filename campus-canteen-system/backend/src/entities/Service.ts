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

export enum ServiceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted",
}

@Entity("services")
@Index(["service_number"])
@Index(["publisher_id"])
@Index(["category"])
@Index(["status"])
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @IsString()
  @Length(1, 50)
  service_number: string;

  @Column({ type: "int" })
  publisher_id: number;

  @Column({ type: "varchar", length: 50 })
  @IsString()
  @Length(1, 50)
  category: string;

  @Column({ type: "text" })
  @IsString()
  description: string;

  @Column({ type: "enum", enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  @IsEnum(ServiceStatus)
  status: ServiceStatus;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(
    () => User,
    (user) => user.services
  )
  @JoinColumn({ name: "publisher_id" })
  publisher: User;
}
