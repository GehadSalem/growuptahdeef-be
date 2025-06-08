import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";
import { CustomInstallmentPlan } from "./CustomInstallmentPlan.entity";

@Entity()
export class MajorGoal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.majorGoals)
  user!: User;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'enum', enum: ['financial', 'personal', 'health', 'education'] })
  category!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  estimatedCost!: number;

  @Column({ type: 'date' })
  targetDate!: Date;

  @Column({ 
    type: 'enum', 
    enum: ['planned', 'in-progress', 'completed', 'postponed'],
    default: 'planned'
  })
  status!: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress!: number;

  @OneToMany(() => CustomInstallmentPlan, installment => installment.linkedGoal)
  linkedInstallments!: CustomInstallmentPlan[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
    static findOne: any;
  static update: any;
    name: any;
}