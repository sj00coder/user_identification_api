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

  @Column({
    type: 'enum',
    enum: ['primary', 'secondary'],
    default: 'primary',
  })
  @IsNotEmpty()
  @IsIn(['primary', 'secondary'])
  linkPrecedence: IlinkPrecedence;

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

  isPrimary(): boolean {
    return this.linkPrecedence === 'primary';
  }

  async getAllsecondaryUsers(): Promise<User[]> {
    let result: User[] = this.secondayUsers || [];
    if (this.isPrimary() && !this.secondayUsers) {
      const user = await User.findById(this.id);
      user && (result = user.secondayUsers);
    } else if (!this.isPrimary()) {
      const user = await User.findById(this.primaryUser.id);
      user && (result = user.secondayUsers);
    }
    return result;
  }

  static async findById(id: number): Promise<User | null> {
    return await User.findOne({
      where: {
        id,
      },
      relations: {
        primaryUser: true,
        secondayUsers: true,
      },
    });
  }
}

export type IlinkPrecedence = 'primary' | 'secondary';
