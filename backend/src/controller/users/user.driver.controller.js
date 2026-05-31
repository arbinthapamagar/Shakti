import { User } from '../../models/user.model.js';
import { Driver } from '../../models/driver.model.js';
import { Document } from '../../models/doeument.model.js';
import { Trip } from '../../models/trip.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';

const COMPATIBLE_VEHICLE_TYPES = {
    bike: ['bike', 'scooter'],
    scooter: ['scooter', 'bike'],
    tuktuk: ['tuktuk', 'tuktuk_delivery'],
    tuktuk_delivery: ['tuktuk_delivery', 'tuktuk'],
    taxi: ['taxi'],
    comfort: ['comfort'],
};

const registerAsDriver = asyncHandler(async (req, res) => {
    const existing = await Driver.findOne({ userId: req.user._id });
    if (existing) throw new apiError(400, 'Already registered as a driver');

    const { vehicleType, vehiclePlate, vehicleModel, vehicleColor, vehicleYear, licenseNumber, licenseExpiry } = req.body;
    if (!vehicleType || !vehiclePlate || !licenseNumber || !licenseExpiry) {
        throw new apiError(400, 'vehicleType, vehiclePlate, licenseNumber, and licenseExpiry are required');
    }

    const plateExists = await Driver.findOne({ vehiclePlate: vehiclePlate.trim().toUpperCase() });
    if (plateExists) throw new apiError(409, 'Vehicle plate already registered');

    const licenseExists = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (licenseExists) throw new apiError(409, 'License number already registered');

    const driver = await Driver.create({
        userId: req.user._id,
        vehicleType,
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        vehicleModel: vehicleModel || null,
        vehicleColor: vehicleColor || null,
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: new Date(licenseExpiry),
    });

    await User.findByIdAndUpdate(req.user._id, { driverProfile: driver._id });
    return res.status(201).json(new apiResponse(201, driver, 'Driver registered. Pending admin approval.'));
});

const getMyDriverProfile = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const documents = await Document.find({ driverId: driver._id }).sort({ type: 1 });
    return res.status(200).json(new apiResponse(200, { driver, documents }, 'Driver profile fetched'));
});

const updateDriverProfile = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const { vehicleModel, vehicleColor, vehicleYear, vehicleCapacity } = req.body;
    const updates = {};
    if (vehicleModel) updates.vehicleModel = vehicleModel;
    if (vehicleColor) updates.vehicleColor = vehicleColor;
    if (vehicleYear) updates.vehicleYear = parseInt(vehicleYear);
    if (vehicleCapacity) updates.vehicleCapacity = parseInt(vehicleCapacity);

    const updated = await Driver.findByIdAndUpdate(driver._id, updates, { new: true });
    return res.status(200).json(new apiResponse(200, updated, 'Driver profile updated'));
});

const uploadDriverDocument = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found. Register as driver first.');

    const { type } = req.body;
    const localFilePath = req.file?.path;
    if (!type) throw new apiError(400, 'Document type is required');
    if (!localFilePath) throw new apiError(400, 'Document file is required');

    const validTypes = ['citizenship', 'driving_license', 'police_clearance', 'vehicle_registration', 'vehicle_plate_back', 'insurance', 'bluebook', 'profile_photo', 'vehicle_photo'];
    if (!validTypes.includes(type)) throw new apiError(400, `Document type must be one of: ${validTypes.join(', ')}`);

    const result = await uploadOnCloudinary(localFilePath);
    if (!result?.secure_url) throw new apiError(500, 'Failed to upload document');

    const document = await Document.findOneAndUpdate(
        { driverId: driver._id, type },
        {
            fileUrl: result.secure_url,
            status: 'pending',
            rejectionReason: null,
            verifiedBy: null,
            verifiedAt: null,
        },
        { upsert: true, new: true }
    );

    return res.status(201).json(new apiResponse(201, document, 'Document uploaded. Pending review.'));
});

const goOnline = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.status !== 'approved') throw new apiError(403, `Driver account is ${driver.status}`);

    driver.isOnline = true;
    driver.lastActiveAt = new Date();
    await driver.save();
    return res.status(200).json(new apiResponse(200, { isOnline: true }, 'You are now online'));
});

const goOffline = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.isOnRide) throw new apiError(400, 'Cannot go offline while on a ride');

    driver.isOnline = false;
    driver.lastActiveAt = new Date();
    await driver.save();
    return res.status(200).json(new apiResponse(200, { isOnline: false }, 'You are now offline'));
});

const updateDriverLocation = asyncHandler(async (req, res) => {
    const { longitude, latitude } = req.body;
    if (longitude === undefined || latitude === undefined) {
        throw new apiError(400, 'Longitude and latitude are required');
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isNaN(lng) || isNaN(lat)) throw new apiError(400, 'Invalid coordinates');
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) throw new apiError(400, 'Coordinates out of range');

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    driver.currentLocation = { type: 'Point', coordinates: [lng, lat] };
    driver.lastActiveAt = new Date();
    await driver.save();
    return res.status(200).json(new apiResponse(200, {}, 'Location updated'));
});

const getNearbyTrips = asyncHandler(async (req, res) => {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    if (!longitude || !latitude) throw new apiError(400, 'Longitude and latitude are required');

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');
    if (driver.status !== 'approved') throw new apiError(403, 'Driver account not approved');
    if (!driver.isOnline) throw new apiError(400, 'You must be online to see nearby trips');

    const compatibleTypes = COMPATIBLE_VEHICLE_TYPES[driver.vehicleType] || [driver.vehicleType];
    const dist = Math.min(parseInt(maxDistance) || 5000, 50000);

    const trips = await Trip.find({
        status: 'pending',
        vehicleType: { $in: compatibleTypes },
        'pickup.location': {
            $near: {
                $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                $maxDistance: dist,
            },
        },
    })
    .limit(20)
    .populate('userId', 'name rating avatarUrl');

    return res.status(200).json(new apiResponse(200, trips, 'Nearby trips fetched'));
});

const getMyEarnings = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id }).select('earnings totalRides rating totalRatings cancelledRides');
    if (!driver) throw new apiError(404, 'Driver profile not found');
    return res.status(200).json(new apiResponse(200, driver, 'Earnings fetched'));
});

export {
    registerAsDriver, getMyDriverProfile, updateDriverProfile, uploadDriverDocument,
    goOnline, goOffline, updateDriverLocation, getNearbyTrips, getMyEarnings,
};
