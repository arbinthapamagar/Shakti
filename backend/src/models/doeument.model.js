import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: true,
        },

        type: {
            type: String,
            enum: [
                'citizenship',
                'driving_license',
                'police_clearance', // compulsory ✅
                'vehicle_registration',
                'insurance',
                'bluebook',
                'profile_photo',
                'vehicle_photo',
            ],
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
        verifiedAt: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
        isExpired: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

documentSchema.index({ driverId: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ expiresAt: 1 });

export const Document = mongoose.model('Document', documentSchema);
