import { Admin } from '../models/admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';

const verifyAdminJwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.adminAccessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) throw new apiError(401, 'Unauthorized request');

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decoded._id).select('-password -refreshToken');
        if (!admin) throw new apiError(401, 'Invalid access token');
        if (!admin.isActive) throw new apiError(403, 'Admin account is deactivated');
        req.admin = admin;
        next();
    } catch (err) {
        if (err instanceof apiError) throw err;
        throw new apiError(401, 'Access token expired or invalid');
    }
});

const requirePermission = (permission) => (req, res, next) => {
    if (!req.admin?.permissions?.[permission]) {
        throw new apiError(403, 'Insufficient permissions');
    }
    next();
};

export { verifyAdminJwt, requirePermission };
