import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity("registration_applications")
@Index(["status"])
@Index(["created_at"])
export class RegistrationApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @IsString()
  @Length(3, 50)
  username: string;

  @Column({ type: "varchar", length: 255 })
  @IsString()
  password: string;

  @Column({ type: "varchar", length: 20, unique: true })
  @IsString()
  @Length(1, 20)
  student_card_id: string;

  @Column({ type: "varchar", length: 50 })
  @IsString()
  @Length(1, 50)
  name: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  @IsString()
  grade?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  @IsString()
  institute?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  @IsString()
  contact_way?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  @IsEmail()
  email?: string;

  @Column({ type: "enum", enum: Gender, nullable: true })
  @IsEnum(Gender)
  gender?: Gender;

  @Column({ type: "varchar", length: 255, nullable: true })
  student_photo_url?: string;

  @Column({ type: "enum", enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column({ type: "datetime", nullable: true })
  reviewed_at?: Date;

  @Column({ type: "int", nullable: true })
  reviewer_id?: number;

  @Column({ type: "text", nullable: true })
  review_comment?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewer_id" })
  reviewer?: User;
}
