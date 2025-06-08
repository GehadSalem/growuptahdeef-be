import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class EmergencyFund {
    @PrimaryGeneratedColumn('uuid')
    id!: string; // Changed to definite assignment assertion

    @Column({ type: 'decimal', precision: 10, scale: 2 }) // Better for monetary values
    amount!: number; // Must be provided

    @Column({ type: 'date' })
    date!: Date; // Must be provided

    @Column()
    description!: string; // Must be provided

    @ManyToOne(() => User, user => user.emergencyFunds)
    user!: User; // Must be provided
}