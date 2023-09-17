import { Contact } from '@src/entity/Contact';

class ContactService {
  constructor() {}
  async identify(params: IdentifyApiParams): Promise<IdentifyApiResponse> {
    let result: IdentifyApiResponse | null = null;

    result = await this._identicalContactData(params);
    if (result) {
      return result;
    }

    return this._nonIdenticalContactData(params);
  }

  private async _nonIdenticalContactData(
    params: IdentifyApiParams,
  ): Promise<IdentifyApiResponse> {
    let result;
    const contactsWithSameEmail = await Contact.find({
      where: {
        email: params.email || undefined,
      },
      relations: {
        primaryContact: true,
        secondayContacts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    const contactsWithSamePhoneNumber = await Contact.find({
      where: {
        phoneNumber: params.phoneNumber || undefined,
      },
      relations: {
        primaryContact: true,
        secondayContacts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!contactsWithSameEmail.length && !contactsWithSamePhoneNumber.length) {
      const contact = await Contact.createNew(
        'primary',
        null,
        params.email,
        params.phoneNumber,
      );
      result = await this._generateOutput(contact);
    } else if (
      contactsWithSameEmail.length &&
      !contactsWithSamePhoneNumber.length
    ) {
      const contact = await Contact.createNew(
        'secondary',
        contactsWithSameEmail[0].isPrimary()
          ? contactsWithSameEmail[0]
          : contactsWithSameEmail[0].primaryContact,
        params.email,
        params.phoneNumber,
      );
      result = await this._generateOutput(contact);
    } else if (
      !contactsWithSameEmail.length &&
      contactsWithSamePhoneNumber.length
    ) {
      const contact = await Contact.createNew(
        'secondary',
        contactsWithSamePhoneNumber[0].isPrimary()
          ? contactsWithSamePhoneNumber[0]
          : contactsWithSamePhoneNumber[0].primaryContact,
        params.email,
        params.phoneNumber,
      );
      result = await this._generateOutput(contact);
    } else {
      let contact;
      const contactWithSameEmail = contactsWithSameEmail[0].isPrimary()
        ? contactsWithSameEmail[0]
        : contactsWithSameEmail[0].primaryContact;

      const contactWithSamePhoneNumber =
        contactsWithSamePhoneNumber[0].isPrimary()
          ? contactsWithSamePhoneNumber[0]
          : contactsWithSamePhoneNumber[0].primaryContact;

      if (
        contactWithSameEmail.createdAt > contactWithSamePhoneNumber.createdAt
      ) {
        contactWithSameEmail.linkPrecedence = 'secondary';
        contactWithSameEmail.primaryContact = contactWithSamePhoneNumber;
        await contactWithSameEmail.save();
        contact = contactWithSamePhoneNumber;
        await this._updateAllSecondryContacts(
          contactWithSameEmail,
          contactWithSamePhoneNumber,
        );
      } else {
        contactWithSamePhoneNumber.linkPrecedence = 'secondary';
        contactWithSamePhoneNumber.primaryContact = contactWithSameEmail;
        await contactWithSamePhoneNumber.save();
        contact = contactWithSameEmail;
        await this._updateAllSecondryContacts(
          contactWithSamePhoneNumber,
          contactWithSameEmail,
        );
      }
      result = await this._generateOutput(contact);
    }

    return result;
  }

  private async _updateAllSecondryContacts(
    updatingContact: Contact,
    updatedPrimaryContact: Contact,
  ) {
    const contact = await Contact.findById(updatingContact.id);
    contact?.secondayContacts.map(async (u) => {
      u.primaryContact = updatedPrimaryContact;
      await u.save();
    });
  }

  private async _identicalContactData(
    params: IdentifyApiParams,
  ): Promise<IdentifyApiResponse | null> {
    let result: IdentifyApiResponse | null = null;
    const identicalContact = await Contact.find({
      where: {
        email: params.email || undefined,
        phoneNumber: params.phoneNumber || undefined,
      },
      relations: {
        primaryContact: true,
        secondayContacts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (identicalContact.length) {
      result = await this._generateOutput(identicalContact[0]);
    }

    return result;
  }
  private async _generateOutput(
    contact: Contact,
  ): Promise<IdentifyApiResponse> {
    const primaryContatctId = contact.isPrimary()
      ? contact.id
      : contact.primaryContact.id;
    const emails = await this._getAllUniqEmail(contact);
    const phoneNumbers = await this._getAllUniqPhone(contact);
    const secondaryContactIds = await this._getAllSecondaryId(contact);
    return {
      primaryContatctId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    };
  }

  private async _getAllUniqEmail(contact: Contact): Promise<Array<string>> {
    const emails = new Set<string>();

    emails.add(contact.email);
    contact.primaryContact && emails.add(contact.primaryContact.email);
    const secondaryContacts = await contact.getAllsecondaryContacts();

    secondaryContacts.map((contact) => {
      emails.add(contact.email);
    });

    return Array.from(emails);
  }

  private async _getAllUniqPhone(contact: Contact): Promise<Array<string>> {
    const phoneNumbers = new Set<string>();

    phoneNumbers.add(contact.phoneNumber);
    contact.primaryContact &&
      phoneNumbers.add(contact.primaryContact.phoneNumber);
    const secondaryContacts = await contact.getAllsecondaryContacts();

    secondaryContacts.map((contact) => {
      phoneNumbers.add(contact.phoneNumber);
    });

    return Array.from(phoneNumbers);
  }

  private async _getAllSecondaryId(contact: Contact): Promise<Array<number>> {
    const secondaryContactIds = new Array<number>();
    const secondaryContacts = await contact.getAllsecondaryContacts();
    secondaryContacts.map((secondarycontact) => {
      secondaryContactIds.push(secondarycontact.id);
    });

    return secondaryContactIds;
  }
}
export type IdentifyApiResponse = {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
};

export type IdentifyApiParams = {
  email: string | null;
  phoneNumber: string | null;
};
export default ContactService;
