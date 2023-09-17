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
@Entity('Contact')
export class Contact extends BaseEntity {
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

  @ManyToOne((type) => Contact, (contact) => contact.secondayContacts)
  @JoinColumn({ name: 'linkedId', referencedColumnName: 'id' })
    primaryContact: Contact;

  @OneToMany(() => Contact, (contact) => contact.primaryContact)
    secondayContacts: Contact[];

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn()
    deletedAt: Date;

  isPrimary(): boolean {
    return this.linkPrecedence === 'primary';
  }

  async getAllsecondaryContacts(): Promise<Contact[]> {
    let result: Contact[] = this.secondayContacts || [];
    if (this.isPrimary()) {
      const contact = await Contact.findById(this.id);
      contact && (result = contact.secondayContacts);
    } else if (!this.isPrimary()) {
      const contact = await Contact.findById(this.primaryContact.id);
      contact && (result = contact.secondayContacts);
    }
    return result;
  }

  static async findById(id: number): Promise<Contact | null> {
    return await Contact.findOne({
      where: {
        id,
      },
      relations: {
        primaryContact: true,
        secondayContacts: true,
      },
    });
  }

  static async createNew(
    linkPrecedence: IlinkPrecedence,
    primaryContact: Contact | null,
    email: string | null,
    phoneNumber: string | null,
  ): Promise<Contact> {
    const contact = new Contact();

    email && (contact.email = email);
    phoneNumber && (contact.phoneNumber = phoneNumber);
    contact.linkPrecedence = linkPrecedence;
    primaryContact && (contact.primaryContact = primaryContact);

    return await contact.save();
  }
}

export type IlinkPrecedence = 'primary' | 'secondary';
