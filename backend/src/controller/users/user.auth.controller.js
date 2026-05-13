import { User } from '../../models/user.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { verifyEmailTemplate } from '../../utils/verifyEmailTemplate.js';
import { sendEmail } from '../../config/sendEmail.js';
import {
    generateAccessToken,
    generateRefreshToken,
} from '../../utils/generateaccesstokenandrefreshtoke.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { generateOtp, otpExpireTime } from '../../utils/generateOtp.js';
import { forgetPasswordTemplate } from '../../utils/forgetPasswordTemplete.js';

import jsonwebtoken from 'jsonwebtoken';

// userRegister handeling

const userRegister = asyncHandler(async (req, res) => {
    const { name, phone, email, password, confirmPassword, avatarUrl, dateOfBirth, gender } =
        req.body;

    /* step to register the user :
      1. first get the data from the frontend 
      2. check if the user already exists
      3. check if the user is valid
      4. hash the password
      5. save the user to the database
      6. return the user
      */

    if (!name || !phone || !password || !gender) {
        throw new apiError(400, ' all field are required ');
    }

    // handeling email regx

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new apiError(400, 'email should be in correct format ');
        }
    }
    // password
    if (password.length < 8) {
        throw new apiError(400, 'Password must be at least 8 characters');
    }

    if (password !== confirmPassword) {
        throw new apiError(400, '  confirm password should match password');
    }

    //check if the user already exits

    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
        throw new apiError(400, ' user already exits with this phoneNumber');
    }

    const otpCode = generateOtp();
    const otpExpiry = otpExpireTime();

    //now create into db

    const user = await User.create({
        name: name.trim(),
        password,
        phone: phone.trim(),
        email: email?.trim(),
        dateOfBirth,
        gender,
        otp: {
            code: otpCode,
            expiresAt: otpExpiry,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${phone}: ${otpCode}`); // free for dev
    } else {
    }
    // terminal shows OTP
    console.log(`OTP for ${phone}: ${otpCode}`);

    if (email) {
        // const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${user._id}`;

        await sendEmail({
            sendTo: email,
            subject: 'Verify your email',
            html: verifyEmailTemplate({
                name: name,
                otp: otpCode,
            }),
        });
    }
     const tempToken = jwt.sign(
    { _id: user._id },
    process.env.TEMP_TOKEN_SECRET,
    { expiresIn: '10m' }
  )
    const userResponse = await User.findById(user._id).select('-password -refreshToken -otp');

    return res.status(201).json(new apiResponse(201, userResponse,tempToken,  'Registered successfully'));
});

const verifyOtp = asyncHandler(async (req, res) => {
    {/*
        1. get phone/email + otp from req.body
2. validate both required
3. find user by phone or email
4. check user exists
5. check otp.code exists in DB
6. check otp not expired
7. check otp matches
8. set isVerified true
9. clear otp from DB
10. generate tokens
11. save refreshToken
12. return response + tokens
        
    */}

 const {otp }= req.body
 

});
