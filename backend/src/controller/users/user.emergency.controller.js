import { Emergency } from '../../models/emergency.model.js';
import { Driver } from '../../models/driver.model.js';
import { User } from '../../models/user.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const triggerEmergency = asyncHandler(async (req, res) => {
    const { lat, lng, address, tripId, message, role } = req.body;

    const user = await User.findById(req.user._id).select('name phone');
    if (!user) throw new apiError(404, 'User not found');

    const driver = await Driver.findOne({ userId: req.user._id }).select('_id');

    const emergency = await Emergency.create({
        userId: req.user._id,
        driverId: driver?._id || null,
        role: role === 'driver' ? 'driver' : 'passenger',
        location: { lat: lat ?? null, lng: lng ?? null },
        address: address || null,
        contactPhone: user.phone || null,
        tripId: tripId || null,
        message: message?.trim() || null,
        status: 'active',
    });

    return res.status(201).json(new apiResponse(201, emergency, 'Emergency alert sent. Help is on the way.'));
});

const getMyEmergencies = asyncHandler(async (req, res) => {
    const list = await Emergency.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json(new apiResponse(200, list, 'Emergencies fetched'));
});

export { triggerEmergency, getMyEmergencies };
