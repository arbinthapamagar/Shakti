import { Driver } from '../models/driver.model.js';
import { Review } from '../models/review.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getDriverPublicProfile = asyncHandler(async (req, res) => {
    const driver = await Driver.findById(req.params.id)
        .select('-documents -refreshToken -poolAssignments')
        .populate('userId', 'name avatarUrl');
    if (!driver) throw new apiError(404, 'Driver not found');

    const reviews = await Review.find({ toDriver: driver._id, reviewType: 'rider_to_driver' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('fromUser', 'name avatarUrl');

    return res.status(200).json(new apiResponse(200, { driver, recentReviews: reviews }, 'Driver profile fetched'));
});

const getDriverReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const driver = await Driver.findById(req.params.id).select('rating totalRatings');
    if (!driver) throw new apiError(404, 'Driver not found');

    const [reviews, total] = await Promise.all([
        Review.find({ toDriver: req.params.id, reviewType: 'rider_to_driver' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('fromUser', 'name avatarUrl'),
        Review.countDocuments({ toDriver: req.params.id }),
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            reviews,
            rating: driver.rating,
            totalRatings: driver.totalRatings,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        }, 'Reviews fetched')
    );
});

export { getDriverPublicProfile, getDriverReviews };
