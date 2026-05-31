import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { logCall, getCallHistory } from '../controller/callLog.controller.js';

const callLogRouter = Router();
callLogRouter.use(verifyUserJwt);

callLogRouter.post('/', logCall);
callLogRouter.get('/trip/:tripId', getCallHistory);

export { callLogRouter };
