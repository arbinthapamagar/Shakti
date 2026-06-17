import { Trip } from '../../models/trip.model.js';
import { Pricing } from '../../models/pricing.model.js';
import { computeStandardFare } from '../../utils/fareCalc.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

function metresBetween([lng1, lat1], [lng2, lat2]) {
    const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

// Standard fare for a vehicle/route, so the app can show it and floor the bid.
const getFareQuote = asyncHandler(async (req, res) => {
    const { vehicleType, distanceKm, city, lat1, lng1, lat2, lng2 } = req.query;
    if (!vehicleType) throw new apiError(400, 'vehicleType is required');

    let km = parseFloat(distanceKm);
    if (!km && lat1 && lng1 && lat2 && lng2) {
        km = metresBetween([parseFloat(lng1), parseFloat(lat1)], [parseFloat(lng2), parseFloat(lat2)]) / 1000;
    }
    if (!km || km <= 0) throw new apiError(400, 'distanceKm or pickup/dropoff coordinates are required');

    const pricing = await Pricing.findOne({ key: 'global' });
    const standardFare = pricing ? computeStandardFare(pricing, { vehicleType, distanceKm: km, cityName: city || null }) : null;

    return res.status(200).json(new apiResponse(200, { vehicleType, distanceKm: km, standardFare }, 'Fare quote'));
});

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

export { getTripHistory, getTripById, getFareQuote };
