import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
    {
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        }, // driver's offered price
        message: {
            type: String,
            default: null,
        }, // optional message to rider

        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'expired'],
            default: 'pending',
        },

        expiresAt: {
            type: Date,
            required: true,
        }, // auto expire if not accepted
    },
    { timestamps: true }
);

bidSchema.index({ tripId: 1 });
bidSchema.index({ driverId: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto delete

export const Bid = mongoose.model('Bid', bidSchema);
