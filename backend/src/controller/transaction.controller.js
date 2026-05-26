import { Transaction } from '../models/transaction.model.js';
import { Driver } from '../models/driver.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getDriverTransactions = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const { page = 1, limit = 20, type } = req.query;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const filter = { driverId: driver._id };
    if (type) filter.type = type;

    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('tripId', 'pickup dropoff vehicleType'),
        Transaction.countDocuments(filter),
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            transactions,
            pagination: { total, page: parseInt(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
        }, 'Driver transactions fetched')
    );
});

export { getDriverTransactions };
