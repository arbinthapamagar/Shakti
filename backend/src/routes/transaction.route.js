import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { getDriverTransactions } from '../controller/transaction.controller.js';

const transactionRouter = Router();
transactionRouter.use(verifyUserJwt);

transactionRouter.get('/driver', getDriverTransactions);

export { transactionRouter };
