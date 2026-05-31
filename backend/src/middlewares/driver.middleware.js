import { Driver } from '../models/driver.model.js';
import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyDriverProfile = asyncHandler(async (req, res, next) => {
    if (!req.user) throw new apiError(401, 'Unauthorized');
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.status !== 'approved') throw new apiError(403, 'Driver account not approved');
    req.driver = driver;
    next();
});

export { verifyDriverProfile };
