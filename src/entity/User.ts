import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { IsIn, IsNotEmpty, IsEmail } from 'class-validator';
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column()
  @IsNotEmpty()
  @IsIn(['primary', 'secondary'])
  linkPrecedence: string;

  @Column()
  @IsEmail()
  email: string;

  @ManyToOne((type) => User, (user) => user.secondayUsers)
  @JoinColumn({ name: 'linkedId', referencedColumnName: 'id' })
  primaryUser: User;

  @OneToMany(() => User, (user) => user.primaryUser)
  secondayUsers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
