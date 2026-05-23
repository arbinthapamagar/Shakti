import { Trip } from '../models/trip.model.js';
import { Bid } from '../models/bid.model.js';
import { Driver } from '../models/driver.model.js';
import { User } from '../models/user.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Notification } from '../models/notification.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createTrip = asyncHandler(async (req, res) => {
    const { vehicleType, offeredPrice, paymentMethod, pickup, dropoff, distance, duration } = req.body;

    if (!vehicleType || !offeredPrice || !pickup || !dropoff) {
        throw new apiError(400, 'vehicleType, offeredPrice, pickup, and dropoff are required');
    }
    if (!pickup.address || !pickup.location?.coordinates) {
        throw new apiError(400, 'Pickup address and coordinates are required');
    }
    if (!dropoff.address || !dropoff.location?.coordinates) {
        throw new apiError(400, 'Dropoff address and coordinates are required');
    }
    if (paymentMethod === 'wallet') {
        const user = await User.findById(req.user._id).select('walletBalance');
        if (user.walletBalance < offeredPrice) {
            throw new apiError(400, 'Insufficient wallet balance');
        }
    }

    const activeTrip = await Trip.findOne({
        userId: req.user._id,
        status: { $in: ['pending', 'accepted', 'arriving', 'started'] },
    });
    if (activeTrip) throw new apiError(400, 'You already have an active trip');

    const trip = await Trip.create({
        userId: req.user._id,
        vehicleType,
        offeredPrice: parseFloat(offeredPrice),
        paymentMethod: paymentMethod || 'cash',
        pickup,
        dropoff,
        distance: distance || null,
        duration: duration || null,
    });

    const nearbyDrivers = await Driver.find({
        isOnline: true,
        isOnRide: false,
        status: 'approved',
        currentLocation: {
            $near: {
                $geometry: { type: 'Point', coordinates: pickup.location.coordinates },
                $maxDistance: 5000,
            },
        },
    }).select('_id').limit(20);

    if (nearbyDrivers.length > 0) {
        const notifs = nearbyDrivers.map(d => ({
            driverId: d._id,
            title: 'New Trip Request',
            body: `${pickup.address} → ${dropoff.address} | NPR ${offeredPrice}`,
            type: 'trip_request',
            refId: trip._id,
        }));
        await Notification.insertMany(notifs);
    }

    return res.status(201).json(new apiResponse(201, trip, 'Trip created'));
});

const getTripById = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id)
        .populate('userId', 'name phone avatarUrl rating')
        .populate({
            path: 'driverId',
            select: 'vehicleType vehiclePlate vehicleModel vehicleColor rating currentLocation userId',
            populate: { path: 'userId', select: 'name phone avatarUrl' },
        });
    if (!trip) throw new apiError(404, 'Trip not found');

    const isRider = trip.userId._id.toString() === req.user._id.toString();
    const driver = await Driver.findOne({ userId: req.user._id });
    const isDriver = driver && trip.driverId?._id?.toString() === driver._id.toString();

    if (!isRider && !isDriver) throw new apiError(403, 'You are not authorized to view this trip');

    return res.status(200).json(new apiResponse(200, trip, 'Trip fetched'));
});

const cancelTrip = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) throw new apiError(404, 'Trip not found');
    if (['completed', 'cancelled'].includes(trip.status)) {
        throw new apiError(400, 'Trip cannot be cancelled');
    }
    if (trip.status === 'started') {
        throw new apiError(400, 'Cannot cancel a trip that is in progress');
    }

    trip.status = 'cancelled';
    trip.cancelledBy = 'rider';
    trip.cancelReason = reason || null;
    trip.cancelledAt = new Date();
    await trip.save();

    await Bid.updateMany({ tripId: trip._id, status: 'pending' }, { status: 'expired' });

    if (trip.driverId) {
        await Driver.findByIdAndUpdate(trip.driverId, { isOnRide: false });
        await Notification.create({
            driverId: trip.driverId,
            title: 'Trip Cancelled',
            body: `Rider cancelled the trip from ${trip.pickup.address}`,
            type: 'trip_cancelled',
            refId: trip._id,
        });
    }

    return res.status(200).json(new apiResponse(200, trip, 'Trip cancelled'));
});

const updateTripStatusByDriver = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) throw new apiError(400, 'Status is required');

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.status !== 'approved') throw new apiError(403, 'Driver account not approved');

    const trip = await Trip.findOne({ _id: req.params.id, driverId: driver._id });
    if (!trip) throw new apiError(404, 'Trip not found');

    const validTransitions = {
        accepted: ['arriving'],
        arriving: ['started'],
        started: ['completed'],
    };

    if (!validTransitions[trip.status]?.includes(status)) {
        throw new apiError(400, `Cannot transition from "${trip.status}" to "${status}"`);
    }

    trip.status = status;

    if (status === 'arriving') {
        await Notification.create({
            userId: trip.userId,
            title: 'Driver Arriving',
            body: 'Your driver is on the way to pick you up',
            type: 'driver_arriving',
            refId: trip._id,
        });
    }

    if (status === 'started') {
        trip.startedAt = new Date();
        await Notification.create({
            userId: trip.userId,
            title: 'Trip Started',
            body: 'Your trip has started',
            type: 'trip_started',
            refId: trip._id,
        });
    }

    if (status === 'completed') {
        trip.completedAt = new Date();
        driver.isOnRide = false;
        driver.totalRides += 1;

        const finalPrice = trip.finalPrice || trip.offeredPrice;
        const platformFee = parseFloat((finalPrice * 0.05).toFixed(2));
        const driverEarning = parseFloat((finalPrice - platformFee).toFixed(2));

        trip.platformFee = platformFee;
        trip.paymentStatus = trip.paymentMethod === 'wallet' ? 'paid' : 'pending';
        trip.finalPrice = finalPrice;

        await Transaction.create([
            { userId: trip.userId, tripId: trip._id, amount: finalPrice, type: 'trip_payment', method: trip.paymentMethod, status: 'completed' },
            { driverId: driver._id, tripId: trip._id, amount: driverEarning, type: 'trip_earning', method: trip.paymentMethod, status: 'completed' },
            { tripId: trip._id, amount: platformFee, type: 'platform_fee', method: trip.paymentMethod, status: 'completed' },
        ]);

        driver.earnings = parseFloat((driver.earnings + driverEarning).toFixed(2));

        if (trip.paymentMethod === 'wallet') {
            await User.findByIdAndUpdate(trip.userId, { $inc: { walletBalance: -finalPrice } });
        }

        await Notification.create({
            userId: trip.userId,
            title: 'Trip Completed',
            body: `Trip completed. Total: NPR ${finalPrice}`,
            type: 'trip_completed',
            refId: trip._id,
        });
    }

    await driver.save();
    await trip.save();
    return res.status(200).json(new apiResponse(200, trip, 'Trip status updated'));
});

const getNearbyDrivers = asyncHandler(async (req, res) => {
    const { longitude, latitude, vehicleType, maxDistance = 5000 } = req.query;
    if (!longitude || !latitude) throw new apiError(400, 'Longitude and latitude are required');

    const filter = {
        isOnline: true,
        isOnRide: false,
        status: 'approved',
        currentLocation: {
            $near: {
                $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                $maxDistance: parseInt(maxDistance),
            },
        },
    };
    if (vehicleType) filter.vehicleType = vehicleType;

    const drivers = await Driver.find(filter)
        .limit(20)
        .select('currentLocation vehicleType vehiclePlate vehicleColor vehicleModel rating totalRides')
        .populate('userId', 'name avatarUrl');

    return res.status(200).json(new apiResponse(200, drivers, 'Nearby drivers fetched'));
});

export { createTrip, getTripById, cancelTrip, updateTripStatusByDriver, getNearbyDrivers };
