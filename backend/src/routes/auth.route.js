import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import {
    userRegister,
    verifyOtp,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    resendOtp,
} from '../controller/users/user.auth.controller.js';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/login', login);
authRouter.post('/logout', verifyUserJwt, logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

export { authRouter };
