import { Bid } from '../models/bid.model.js';
import { Trip } from '../models/trip.model.js';
import { Driver } from '../models/driver.model.js';
import { Notification } from '../models/notification.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createBid = asyncHandler(async (req, res) => {
    const { tripId, amount, message } = req.body;
    if (!tripId || !amount) throw new apiError(400, 'Trip ID and amount are required');

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.status !== 'approved') throw new apiError(403, 'Driver account not approved');
    if (!driver.isOnline) throw new apiError(400, 'You must be online to place bids');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new apiError(404, 'Trip not found');
    if (trip.status !== 'pending') throw new apiError(400, 'Trip is no longer accepting bids');

    const existingBid = await Bid.findOne({ tripId, driverId: driver._id, status: 'pending' });
    if (existingBid) throw new apiError(400, 'You have already placed a bid on this trip');

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const bid = await Bid.create({
        tripId,
        driverId: driver._id,
        amount: parseFloat(amount),
        message: message || null,
        expiresAt,
    });

    await Notification.create({
        userId: trip.userId,
        title: 'New Bid Received',
        body: `A driver offered NPR ${amount} for your trip`,
        type: 'bid_received',
        refId: bid._id,
    });

    return res.status(201).json(new apiResponse(201, bid, 'Bid placed'));
});

const getBidsForTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user._id });
    if (!trip) throw new apiError(404, 'Trip not found');

    const bids = await Bid.find({ tripId: req.params.tripId, status: 'pending' })
        .sort({ amount: 1 })
        .populate({
            path: 'driverId',
            select: 'vehicleType vehiclePlate vehicleModel vehicleColor rating totalRides currentLocation',
            populate: { path: 'userId', select: 'name avatarUrl' },
        });

    return res.status(200).json(new apiResponse(200, bids, 'Bids fetched'));
});

const acceptBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id);
    if (!bid) throw new apiError(404, 'Bid not found');
    if (bid.status !== 'pending') throw new apiError(400, 'Bid is no longer pending');

    const trip = await Trip.findOne({ _id: bid.tripId, userId: req.user._id });
    if (!trip) throw new apiError(404, 'Trip not found');
    if (trip.status !== 'pending') throw new apiError(400, 'Trip is no longer pending');

    bid.status = 'accepted';
    await bid.save();

    trip.driverId = bid.driverId;
    trip.finalPrice = bid.amount;
    trip.status = 'accepted';
    trip.acceptedAt = new Date();
    await trip.save();

    await Bid.updateMany(
        { tripId: bid.tripId, _id: { $ne: bid._id }, status: 'pending' },
        { status: 'rejected' }
    );

    await Driver.findByIdAndUpdate(bid.driverId, { isOnRide: true });

    await Notification.create({
        driverId: bid.driverId,
        title: 'Bid Accepted',
        body: `Your bid of NPR ${bid.amount} was accepted`,
        type: 'bid_accepted',
        refId: trip._id,
    });

    return res.status(200).json(new apiResponse(200, { bid, trip }, 'Bid accepted'));
});

const rejectBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id);
    if (!bid) throw new apiError(404, 'Bid not found');

    const trip = await Trip.findOne({ _id: bid.tripId, userId: req.user._id });
    if (!trip) throw new apiError(403, 'Unauthorized');
    if (bid.status !== 'pending') throw new apiError(400, 'Bid is not pending');

    bid.status = 'rejected';
    await bid.save();

    return res.status(200).json(new apiResponse(200, bid, 'Bid rejected'));
});

const getMyBids = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { driverId: driver._id };
    if (status) filter.status = status;

    const [bids, total] = await Promise.all([
        Bid.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('tripId', 'pickup dropoff offeredPrice status vehicleType'),
        Bid.countDocuments(filter),
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            bids,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        }, 'My bids fetched')
    );
});

export { createBid, getBidsForTrip, acceptBid, rejectBid, getMyBids };
