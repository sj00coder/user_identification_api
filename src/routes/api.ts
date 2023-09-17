import { Router } from 'express';

import Paths from '../constants/Paths';
import contactController from '@src/controllers/contactController';
import jetValidator from 'jet-validator';
import { isEmailOrNull, isStringOrNull } from '@src/utils/validators';

// **** Variables **** //

const apiRouter = Router(),
  validate = jetValidator();
// ** Add ContactRouter ** //

const contactRouter = Router();

contactRouter.post(
  Paths.Contacts.Identify,
  validate(['email', isEmailOrNull], ['phoneNumber', isStringOrNull]),
  contactController.identify,
);

apiRouter.use(Paths.Contacts.Base, contactRouter);

// **** Export default **** //

export default apiRouter;
