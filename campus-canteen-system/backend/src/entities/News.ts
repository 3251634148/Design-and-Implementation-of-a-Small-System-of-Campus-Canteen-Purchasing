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

export enum NewsStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

@Entity("news")
@Index(["status"])
@Index(["created_at"])
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200 })
  @IsString()
  @Length(1, 200)
  title: string;

  @Column({ type: "text" })
  @IsString()
  content: string;

  @Column({ type: "int", nullable: true })
  author_id?: number;

  @Column({ type: "enum", enum: NewsStatus, default: NewsStatus.PUBLISHED })
  @IsEnum(NewsStatus)
  status: NewsStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(
    () => User,
    (user) => user.news
  )
  @JoinColumn({ name: "author_id" })
  author?: User;
}
