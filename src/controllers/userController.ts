import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import UserService from '@src/services/userService';
import { Request, Response } from 'express';

const userService = new UserService();
// **** Functions **** //

async function identify(req: Request, res: Response) {
  const { email, phoneNumber } = req.body as {
    email: string | null;
    phoneNumber: string | null;
  };
  const data = await userService.identify({ email, phoneNumber });
  return res.status(HttpStatusCodes.OK).json({ contact: { ...data } });
}
export default {
  identify,
} as const;
