import { Trip } from '../../models/trip.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const getTripHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const [trips, total] = await Promise.all([
        Trip.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'driverId',
                select: 'vehicleType vehiclePlate vehicleModel vehicleColor rating userId',
                populate: { path: 'userId', select: 'name avatarUrl' },
            }),
        Trip.countDocuments(filter),
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            trips,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        }, 'Trip history fetched')
    );
});

const getTripById = asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id })
        .populate({
            path: 'driverId',
            select: 'vehicleType vehiclePlate vehicleModel vehicleColor rating currentLocation userId',
            populate: { path: 'userId', select: 'name phone avatarUrl' },
        });
    if (!trip) throw new apiError(404, 'Trip not found');
    return res.status(200).json(new apiResponse(200, trip, 'Trip fetched'));
});

export { getTripHistory, getTripById };
