import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsString, IsEmail, IsEnum, Length } from "class-validator";
import { User } from "./User";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity("student_profiles")
export class StudentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  user_id: number;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @OneToOne(
    () => User,
    (user) => user.profile
  )
  @JoinColumn({ name: "user_id" })
  user: User;
}
