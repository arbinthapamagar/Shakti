import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            default: null,
        },

        title: { type: String, required: true },
        body: { type: String, required: true },
        type: {
            type: String,
            enum: [
                'trip_request',
                'bid_received',
                'bid_accepted',
                'driver_arriving',
                'trip_started',
                'trip_completed',
                'trip_cancelled',
                'subscription_alert',
                'document_verified',
                'document_rejected',
                'payment',
                'general',
            ],
            required: true,
        },

        refId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        }, // tripId, bidId etc

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ driverId: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
