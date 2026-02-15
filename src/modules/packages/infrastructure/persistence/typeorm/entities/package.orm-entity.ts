import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PackageStatus } from '@modules/packages/domain/entities/package.entity';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/typeorm/entities/user.orm-entity';

@Entity('packages')
export class PackageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 20 })
  trackingCode: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @Column({ length: 300 })
  originAddress: string;

  @Column({ length: 300 })
  destinationAddress: string;

  @Column({ length: 120 })
  recipientName: string;

  @Column({ length: 20 })
  recipientPhone: string;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.PENDING,
  })
  status: PackageStatus;

  @Column()
  ownerId: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: UserOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
