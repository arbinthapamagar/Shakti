import { User } from '../../models/user.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const getWallet = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('walletBalance preferredPaymentMethod');
    return res.status(200).json(new apiResponse(200, user, 'Wallet fetched'));
});

const getTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const filter = { userId: req.user._id };
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
        }, 'Transactions fetched')
    );
});

const topUpWallet = asyncHandler(async (req, res) => {
    const { amount, method, gatewayRef } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) throw new apiError(400, 'Valid amount is required');
    if (parsedAmount > 100000) throw new apiError(400, 'Maximum top-up amount is NPR 100,000');

    if (!method || !['khalti', 'esewa'].includes(method)) {
        throw new apiError(400, 'Payment method must be khalti or esewa');
    }

    if (!gatewayRef || gatewayRef.trim().length < 5) {
        throw new apiError(400, 'Valid payment gateway reference is required');
    }

    const transaction = await Transaction.create({
        userId: req.user._id,
        amount: parsedAmount,
        type: 'wallet_topup',
        method,
        status: 'completed',
        gatewayRef: gatewayRef.trim(),
    });

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { walletBalance: parsedAmount } },
        { new: true }
    ).select('walletBalance');

    return res.status(201).json(
        new apiResponse(201, { transaction, walletBalance: user.walletBalance }, 'Wallet topped up')
    );
});

export { getWallet, getTransactions, topUpWallet };
