import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { getDriverPublicProfile, getDriverReviews } from '../controller/driver.controller.js';

const driverRouter = Router();

driverRouter.get('/:id', verifyUserJwt, getDriverPublicProfile);
driverRouter.get('/:id/reviews', verifyUserJwt, getDriverReviews);

export { driverRouter };
