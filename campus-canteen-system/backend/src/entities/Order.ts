import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { IsString, IsNumber, IsEnum, IsPositive, Length } from "class-validator";
import { User } from "./User";
import { Complaint } from "./Complaint";

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum OrderCategory {
  CHINESE_FAST_FOOD = "中式快餐",
  WESTERN_FAST_FOOD = "西式快餐",
  JAPANESE_KOREAN = "日韩料理",
  NOODLES = "面食",
  RICE = "米饭",
  SOUP = "汤品",
  SNACK = "小食",
  BEVERAGE = "饮品",
  OTHER = "其他",
}

@Entity("orders")
@Index(["order_number"])
@Index(["publisher_id"])
@Index(["accepter_id"])
@Index(["status"])
@Index(["category"])
@Index(["published_at"])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @IsString()
  @Length(1, 50)
  order_number: string;

  @Column({ type: "int" })
  publisher_id: number;

  @Column({ type: "int", nullable: true })
  accepter_id?: number;

  @Column({ type: "text" })
  @IsString()
  delivery_address: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  @IsNumber()
  tip: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  @IsNumber()
  @IsPositive()
  meal_cost: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Column({ type: "varchar", length: 20 })
  @IsString()
  category: string;

  @Column({ type: "varchar", length: 100 })
  @IsString()
  @Length(1, 100)
  restaurant: string;

  @Column({ type: "text" })
  @IsString()
  meal_description: string;

  @Column({ type: "int", default: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  published_at: Date;

  @Column({ type: "timestamp", nullable: true })
  accepted_at?: Date;

  @Column({ type: "timestamp", nullable: true })
  completed_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(
    () => User,
    (user) => user.published_orders
  )
  @JoinColumn({ name: "publisher_id" })
  publisher: User;

  @ManyToOne(
    () => User,
    (user) => user.accepted_orders
  )
  @JoinColumn({ name: "accepter_id" })
  accepter?: User;

  @OneToMany(
    () => Complaint,
    (complaint) => complaint.order
  )
  complaints: Complaint[];
}
