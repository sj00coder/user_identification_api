import { User } from '@src/entity/User';

/**
 * Get all users.
 */
function getAll(): Promise<User[]> {
  return User.find();
}

// **** Export default **** //

export default {
  getAll,
} as const;
