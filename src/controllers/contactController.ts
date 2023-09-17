import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import ContactService from '@src/services/contactService';
import { Request, Response } from 'express';

const contactService = new ContactService();
// **** Functions **** //

async function identify(req: Request, res: Response) {
  const { email, phoneNumber } = req.body as {
    email: string | null;
    phoneNumber: string | null;
  };
  const data = await contactService.identify({ email, phoneNumber });
  return res.status(HttpStatusCodes.OK).json({ contact: { ...data } });
}
export default {
  identify,
} as const;
