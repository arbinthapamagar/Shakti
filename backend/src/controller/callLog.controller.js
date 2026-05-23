import { CallLog } from '../models/callLog.model.js';
import { Trip } from '../models/trip.model.js';
import { Driver } from '../models/driver.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const logCall = asyncHandler(async (req, res) => {
    const { tripId, receiverId, status, duration } = req.body;
    if (!tripId || !receiverId || !status) {
        throw new apiError(400, 'Trip ID, receiver ID, and status are required');
    }

    const trip = await Trip.findById(tripId);
    if (!trip) throw new apiError(404, 'Trip not found');

    const driver = await Driver.findOne({ userId: req.user._id });
    const isRider = trip.userId.toString() === req.user._id.toString();
    const isDriver = driver && trip.driverId?.toString() === driver._id.toString();
    if (!isRider && !isDriver) throw new apiError(403, 'You are not part of this trip');

    const callLog = await CallLog.create({
        tripId,
        callerId: req.user._id,
        callerType: isRider ? 'rider' : 'driver',
        receiverId,
        status,
        duration: duration || 0,
    });

    return res.status(201).json(new apiResponse(201, callLog, 'Call logged'));
});

const getCallHistory = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) throw new apiError(404, 'Trip not found');

    const driver = await Driver.findOne({ userId: req.user._id });
    const isRider = trip.userId.toString() === req.user._id.toString();
    const isDriver = driver && trip.driverId?.toString() === driver._id.toString();
    if (!isRider && !isDriver) throw new apiError(403, 'You are not part of this trip');

    const callLogs = await CallLog.find({ tripId }).sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse(200, callLogs, 'Call history fetched'));
});

export { logCall, getCallHistory };
