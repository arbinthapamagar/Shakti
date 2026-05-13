import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        toDriver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            default: null,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: null,
        },

        reviewType: {
            type: String,
            enum: ['rider_to_driver', 'driver_to_rider'],
            required: true,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ tripId: 1 });
reviewSchema.index({ toDriver: 1 });
reviewSchema.index({ toUser: 1 });

export const Review = mongoose.model('Review', reviewSchema);
