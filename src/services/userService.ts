import { User, IlinkPrecedence } from '@src/entity/User';

/**
 * Get all users.
 */
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

async function getAll(): Promise<User[]> {
  return await User.find();
}

async function identify(
  params: IdentifyApiParams
): Promise<IdentifyApiResponse> {
  let result: IdentifyApiResponse | null = null;

  result = await _identicalUsers(params);
  if (result) {
    return result;
  }

  return _nonIdenticalUser(params);
}

async function _nonIdenticalUser(
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
    const user = await addUser(
      'primary',
      null,
      params.email,
      params.phoneNumber
    );
    result = await _generateOutput(user);
  } else if (usersWithSameEmail.length && !usersWithSamePhoneNumber.length) {
    const user = await addUser(
      'secondary',
      usersWithSameEmail[0].isPrimary()
        ? usersWithSameEmail[0]
        : usersWithSameEmail[0].primaryUser,
      params.email,
      params.phoneNumber
    );
    result = await _generateOutput(user);
  } else if (!usersWithSameEmail.length && usersWithSamePhoneNumber.length) {
    const user = await addUser(
      'secondary',
      usersWithSamePhoneNumber[0].isPrimary()
        ? usersWithSamePhoneNumber[0]
        : usersWithSamePhoneNumber[0].primaryUser,
      params.email,
      params.phoneNumber
    );
    result = await _generateOutput(user);
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
      await updateAllSecondryUsers(userWithSameEmail, userWithSamePhoneNumber);
    } else {
      userWithSamePhoneNumber.linkPrecedence = 'secondary';
      userWithSamePhoneNumber.primaryUser = userWithSameEmail;
      await userWithSamePhoneNumber.save();
      user = userWithSameEmail;
      await updateAllSecondryUsers(userWithSamePhoneNumber, userWithSameEmail);
    }

    result = await _generateOutput(user);
  }

  return result;
}

async function updateAllSecondryUsers(
  updatingUser: User,
  updatedPrimaryUser: User
) {
  const user = await User.findById(updatingUser.id);
  user?.secondayUsers.map(async (u) => {
    u.primaryUser = updatedPrimaryUser;
    await u.save();
  });
}
async function addUser(
  linkPrecedence: IlinkPrecedence,
  primaryUser: User | null,
  email: string | null,
  phoneNumber: string | null
): Promise<User> {
  const user = new User();

  email && (user.email = email);
  phoneNumber && (user.phoneNumber = phoneNumber);
  user.linkPrecedence = linkPrecedence;
  primaryUser && (user.primaryUser = primaryUser);

  return await user.save();
}
async function _identicalUsers(
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
    result = await _generateOutput(identicalUser[0]);
  }

  return result;
}
async function _generateOutput(user: User): Promise<IdentifyApiResponse> {
  const primaryContatctId = user.isPrimary() ? user.id : user.primaryUser.id;
  const emails = await _getAllUniqEmail(user);
  const phoneNumbers = await _getAllUniqPhone(user);
  const secondaryContactIds = await _getAllSecondaryId(user);
  return {
    primaryContatctId,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
}

async function _getAllUniqEmail(user: User): Promise<Array<string>> {
  const emails = new Set<string>();

  emails.add(user.email);
  user.primaryUser && emails.add(user.primaryUser.email);
  const secondaryUsers = await user.getAllsecondaryUsers();

  secondaryUsers.map((user) => {
    emails.add(user.email);
  });

  return Array.from(emails);
}

async function _getAllUniqPhone(user: User): Promise<Array<string>> {
  const phoneNumbers = new Set<string>();

  phoneNumbers.add(user.phoneNumber);
  user.primaryUser && phoneNumbers.add(user.primaryUser.phoneNumber);
  const secondaryUsers = await user.getAllsecondaryUsers();

  secondaryUsers.map((user) => {
    phoneNumbers.add(user.phoneNumber);
  });

  return Array.from(phoneNumbers);
}

async function _getAllSecondaryId(user: User): Promise<Array<number>> {
  const secondaryUserIds = new Array<number>();
  const secondaryUsers = await user.getAllsecondaryUsers();
  secondaryUsers.map((secondaryuser) => {
    secondaryUserIds.push(secondaryuser.id);
  });

  return secondaryUserIds;
}

export default {
  getAll,
  identify,
} as const;
