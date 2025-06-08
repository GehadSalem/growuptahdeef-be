import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User.entity";
@Entity()
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.id)
  user!: User;

  @Column()
  amount!: number;
  
  @Column()
  description!: string;

  @Column({ type: 'date' })
  date!: Date;
}
