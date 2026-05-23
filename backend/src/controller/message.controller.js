import { Message } from '../models/message.model.js';
import { Trip } from '../models/trip.model.js';
import { Driver } from '../models/driver.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sendMessage = asyncHandler(async (req, res) => {
    const { tripId, message } = req.body;
    if (!tripId || !message) throw new apiError(400, 'Trip ID and message are required');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new apiError(404, 'Trip not found');
    if (['completed', 'cancelled'].includes(trip.status)) {
        throw new apiError(400, 'Cannot send messages for ended trips');
    }

    const driver = await Driver.findOne({ userId: req.user._id });
    const isRider = trip.userId.toString() === req.user._id.toString();
    const isDriver = driver && trip.driverId?.toString() === driver._id.toString();

    if (!isRider && !isDriver) throw new apiError(403, 'You are not part of this trip');

    const msg = await Message.create({
        tripId,
        senderId: req.user._id,
        senderType: isRider ? 'rider' : 'driver',
        message,
    });

    return res.status(201).json(new apiResponse(201, msg, 'Message sent'));
});

const getMessages = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) throw new apiError(404, 'Trip not found');

    const driver = await Driver.findOne({ userId: req.user._id });
    const isRider = trip.userId.toString() === req.user._id.toString();
    const isDriver = driver && trip.driverId?.toString() === driver._id.toString();
    if (!isRider && !isDriver) throw new apiError(403, 'You are not part of this trip');

    const messages = await Message.find({ tripId }).sort({ createdAt: 1 });

    await Message.updateMany(
        { tripId, senderId: { $ne: req.user._id }, isRead: false },
        { isRead: true }
    );

    return res.status(200).json(new apiResponse(200, messages, 'Messages fetched'));
});

export { sendMessage, getMessages };
