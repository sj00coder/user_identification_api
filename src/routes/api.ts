import { Router } from 'express';

import Paths from '../constants/Paths';
import userController from '@src/controllers/userController';

// **** Variables **** //

const apiRouter = Router();
// ** Add UserRouter ** //

const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, userController.getAll);

apiRouter.use(Paths.Users.Base, userRouter);

// **** Export default **** //

export default apiRouter;
