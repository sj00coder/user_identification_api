import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import UserService from '@src/services/userService';
import { Request, Response } from 'express';

// **** Functions **** //

/**
 * Get all users.
 */
async function getAll(_: Request, res: Response) {
  const users = await UserService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}

async function identify(req: Request, res: Response) {
  const { email, phoneNumber } = req.body as {
    email: string | null;
    phoneNumber: string | null;
  };
  const data = await UserService.identify({ email, phoneNumber });
  return res.status(HttpStatusCodes.OK).json({ contact: { ...data } });
}
export default {
  getAll,
  identify,
} as const;
