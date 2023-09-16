import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import UserService from '@src/services/userService';
import { Request, Response } from 'express';

// **** Functions **** //

/**
 * Get all users.
 */
async function getAll(_: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const users = await UserService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}
export default {
  getAll,
} as const;
