import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from "typeorm";
import { IsString, IsBoolean, Length } from "class-validator";
import { StudentProfile } from "./StudentProfile";
import { Order } from "./Order";
import { Service } from "./Service";
import { Complaint } from "./Complaint";
import { News } from "./News";

@Entity("users")
@Index(["username"])
@Index(["is_admin"])
@Index(["is_frozen"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @IsString()
  @Length(3, 50)
  username: string;

  @Column({ type: "varchar", length: 255 })
  @IsString()
  password: string;

  @Column({ type: "boolean", default: false })
  @IsBoolean()
  is_admin: boolean;

  @Column({ type: "boolean", default: false })
  @IsBoolean()
  is_frozen: boolean;

  @Column({ type: "int", default: 100 })
  credit_score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @OneToOne(
    () => StudentProfile,
    (profile) => profile.user,
    { cascade: true }
  )
  profile: StudentProfile;

  @OneToMany(
    () => Order,
    (order) => order.publisher
  )
  published_orders: Order[];

  @OneToMany(
    () => Order,
    (order) => order.accepter
  )
  accepted_orders: Order[];

  @OneToMany(
    () => Service,
    (service) => service.publisher
  )
  services: Service[];

  @OneToMany(
    () => Complaint,
    (complaint) => complaint.complainant
  )
  filed_complaints: Complaint[];

  @OneToMany(
    () => Complaint,
    (complaint) => complaint.complained
  )
  received_complaints: Complaint[];

  @OneToMany(
    () => Complaint,
    (complaint) => complaint.processed_by_user
  )
  processed_complaints: Complaint[];

  @OneToMany(
    () => News,
    (news) => news.author
  )
  news: News[];
}
