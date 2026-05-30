import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { createBid, getBidsForTrip, acceptBid, rejectBid, getMyBids } from '../controller/bid.controller.js';

const bidRouter = Router();
bidRouter.use(verifyUserJwt);

bidRouter.get('/my-bids', getMyBids);
bidRouter.get('/trip/:tripId', getBidsForTrip);
bidRouter.post('/', createBid);
bidRouter.put('/:id/accept', acceptBid);
bidRouter.put('/:id/reject', rejectBid);

export { bidRouter };
