import { User } from '@src/entity/User';

class UserService {
  constructor() {}
  async identify(params: IdentifyApiParams): Promise<IdentifyApiResponse> {
    let result: IdentifyApiResponse | null = null;

    result = await this._identicalUserData(params);
    if (result) {
      return result;
    }

    return this._nonIdenticalUserData(params);
  }

  private async _nonIdenticalUserData(
    params: IdentifyApiParams
  ): Promise<IdentifyApiResponse> {
    let result;
    const usersWithSameEmail = await User.find({
      where: {
        email: params.email || undefined,
      },
      relations: {
        primaryUser: true,
        secondayUsers: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    const usersWithSamePhoneNumber = await User.find({
      where: {
        phoneNumber: params.phoneNumber || undefined,
      },
      relations: {
        primaryUser: true,
        secondayUsers: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!usersWithSameEmail.length && !usersWithSamePhoneNumber.length) {
      const user = await User.createNew(
        'primary',
        null,
        params.email,
        params.phoneNumber
      );
      result = await this._generateOutput(user);
    } else if (usersWithSameEmail.length && !usersWithSamePhoneNumber.length) {
      const user = await User.createNew(
        'secondary',
        usersWithSameEmail[0].isPrimary()
          ? usersWithSameEmail[0]
          : usersWithSameEmail[0].primaryUser,
        params.email,
        params.phoneNumber
      );
      result = await this._generateOutput(user);
    } else if (!usersWithSameEmail.length && usersWithSamePhoneNumber.length) {
      const user = await User.createNew(
        'secondary',
        usersWithSamePhoneNumber[0].isPrimary()
          ? usersWithSamePhoneNumber[0]
          : usersWithSamePhoneNumber[0].primaryUser,
        params.email,
        params.phoneNumber
      );
      result = await this._generateOutput(user);
    } else {
      let user;
      const userWithSameEmail = usersWithSameEmail[0].isPrimary()
        ? usersWithSameEmail[0]
        : usersWithSameEmail[0].primaryUser;

      const userWithSamePhoneNumber = usersWithSamePhoneNumber[0].isPrimary()
        ? usersWithSamePhoneNumber[0]
        : usersWithSamePhoneNumber[0].primaryUser;

      if (userWithSameEmail.createdAt > userWithSamePhoneNumber.createdAt) {
        userWithSameEmail.linkPrecedence = 'secondary';
        userWithSameEmail.primaryUser = userWithSamePhoneNumber;
        await userWithSameEmail.save();
        user = userWithSamePhoneNumber;
        await this._updateAllSecondryUsers(
          userWithSameEmail,
          userWithSamePhoneNumber
        );
      } else {
        userWithSamePhoneNumber.linkPrecedence = 'secondary';
        userWithSamePhoneNumber.primaryUser = userWithSameEmail;
        await userWithSamePhoneNumber.save();
        user = userWithSameEmail;
        await this._updateAllSecondryUsers(
          userWithSamePhoneNumber,
          userWithSameEmail
        );
      }

      result = await this._generateOutput(user);
    }

    return result;
  }

  private async _updateAllSecondryUsers(
    updatingUser: User,
    updatedPrimaryUser: User
  ) {
    const user = await User.findById(updatingUser.id);
    user?.secondayUsers.map(async (u) => {
      u.primaryUser = updatedPrimaryUser;
      await u.save();
    });
  }

  private async _identicalUserData(
    params: IdentifyApiParams
  ): Promise<IdentifyApiResponse | null> {
    let result: IdentifyApiResponse | null = null;
    const identicalUser = await User.find({
      where: {
        email: params.email || undefined,
        phoneNumber: params.phoneNumber || undefined,
      },
      relations: {
        primaryUser: true,
        secondayUsers: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (identicalUser.length) {
      result = await this._generateOutput(identicalUser[0]);
    }

    return result;
  }
  private async _generateOutput(user: User): Promise<IdentifyApiResponse> {
    const primaryContatctId = user.isPrimary() ? user.id : user.primaryUser.id;
    const emails = await this._getAllUniqEmail(user);
    const phoneNumbers = await this._getAllUniqPhone(user);
    const secondaryContactIds = await this._getAllSecondaryId(user);
    return {
      primaryContatctId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    };
  }

  private async _getAllUniqEmail(user: User): Promise<Array<string>> {
    const emails = new Set<string>();

    emails.add(user.email);
    user.primaryUser && emails.add(user.primaryUser.email);
    const secondaryUsers = await user.getAllsecondaryUsers();

    secondaryUsers.map((user) => {
      emails.add(user.email);
    });

    return Array.from(emails);
  }

  private async _getAllUniqPhone(user: User): Promise<Array<string>> {
    const phoneNumbers = new Set<string>();

    phoneNumbers.add(user.phoneNumber);
    user.primaryUser && phoneNumbers.add(user.primaryUser.phoneNumber);
    const secondaryUsers = await user.getAllsecondaryUsers();

    secondaryUsers.map((user) => {
      phoneNumbers.add(user.phoneNumber);
    });

    return Array.from(phoneNumbers);
  }

  private async _getAllSecondaryId(user: User): Promise<Array<number>> {
    const secondaryUserIds = new Array<number>();
    const secondaryUsers = await user.getAllsecondaryUsers();
    secondaryUsers.map((secondaryuser) => {
      secondaryUserIds.push(secondaryuser.id);
    });

    return secondaryUserIds;
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
export default UserService;
