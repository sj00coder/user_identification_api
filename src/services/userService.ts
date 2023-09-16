import { User } from '@src/entity/User';

/**
 * Get all users.
 */
async function getAll(): Promise<User[]> {
  return await User.find();
}

// **** Export default **** //

export default {
  getAll,
} as const;
