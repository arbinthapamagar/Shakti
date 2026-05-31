import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';

const verifyUserJwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) throw new apiError(401, 'Unauthorized request');

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select('-password -refreshToken -otp');
        if (!user) throw new apiError(401, 'Invalid access token');
        if (user.accountStatus === 'banned') throw new apiError(403, 'Account has been banned');
        if (user.accountStatus === 'suspended') throw new apiError(403, 'Account has been suspended');
        req.user = user;
        next();
    } catch (err) {
        if (err instanceof apiError) throw err;
        throw new apiError(401, 'Access token expired or invalid');
    }
});

export { verifyUserJwt };
