import { Router } from 'express';

import Paths from '../constants/Paths';
import userController from '@src/controllers/userController';
import jetValidator from 'jet-validator';
import { isEmailOrNull, isStringOrNull } from '@src/utils/validators';

// **** Variables **** //

const apiRouter = Router(),
  validate = jetValidator();
// ** Add UserRouter ** //

const userRouter = Router();

userRouter.post(
  Paths.Users.Identify,
  validate(['email', isEmailOrNull], ['phoneNumber', isStringOrNull]),
  userController.identify
);

apiRouter.use(Paths.Users.Base, userRouter);

// **** Export default **** //

export default apiRouter;
