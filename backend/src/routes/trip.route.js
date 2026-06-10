import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { verifyDriverProfile } from '../middlewares/driver.middleware.js';
import { createTrip, getTripById, cancelTrip, updateTripStatusByDriver, getNearbyDrivers } from '../controller/trip.controller.js';

const tripRouter = Router();
tripRouter.use(verifyUserJwt);

tripRouter.get('/nearby-drivers', getNearbyDrivers);
tripRouter.post('/', createTrip);
tripRouter.get('/:id', getTripById);
tripRouter.put('/:id/cancel', cancelTrip);
tripRouter.put('/:id/status', verifyDriverProfile, updateTripStatusByDriver);

export { tripRouter };
