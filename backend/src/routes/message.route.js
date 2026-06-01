import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { sendMessage, getMessages } from '../controller/message.controller.js';

const messageRouter = Router();
messageRouter.use(verifyUserJwt);

messageRouter.post('/', sendMessage);
messageRouter.get('/trip/:tripId', getMessages);

export { messageRouter };
