import { Admin } from '../models/admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// access the refreshToken from the cookie if no token then throw an api error

const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new apiError(401, 'unauthorized request!');
  }

  //decoding the token
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id).select(
      '-password -refreshToken',
    );

    if (!admin) {
      throw new apiError(401, ' Invalid refresh token ');
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new apiError(401, 'Access token expired or invalid ');
  }
});

export { verifyJwt };