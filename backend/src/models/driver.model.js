const mongoose = require('mongoose');
const { Schema } = mongoose;

const driverSchema = new Schema(
    {
        // link to user
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        // vehicle info
        vehicleType: {
            type: String,
            enum: ['bike', 'car', 'ev'],
            required: true,
        },
        vehiclePlate: {
            type: String,
            required: true,
            unique: true,
        },
        vehicleModel: {
            type: String,
        }, // e.g. "Honda City"
        vehicleColor: {
            type: String,
        }, // e.g. "White"
        vehicleYear: {
            type: Number,
        }, // e.g. 2020

        // license
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        licenseExpiry: {
            type: Date,
            required: true,
        },

        // verification by admin
        status: {
            type: String,
            enum: ['pending', 'approved', 'suspended', 'rejected'],
            default: 'pending',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        // real-time state
        isOnline: {
            type: Boolean,
            default: false,
        },
        isOnRide: {
            type: Boolean,
            default: false,
        },

        // location (for $near queries)
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },

        // stats
        rating: {
            type: Number,
            default: 0,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },
        totalRides: {
            type: Number,
            default: 0,
        },
        earnings: {
            type: Number,
            default: 0,
        },

        // cancellation tracking
        cancelledRides: {
            type: Number,
            default: 0,
        },

        lastActiveAt: {
            type: Date,
            default: null,
        },

        vehicleCapacity: {
            type: Number,
            default: 4,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        poolAssignments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Subscription',
            },
        ],
        documents: {
            licenseImage: {
                type: String,
                default: null,
            },
            citizenshipImage: {
                type: String,
                default: null,
            },
            vehicleImage: {
                type: String,
                default: null,
            },
            insuranceImage: {
                type: String,
                default: null,
            },
            bluebook: {
                type: String,
                default: null,
            },
            policeReport: {
                type: String,
                required: [true, 'polic report is mandatory '],
            },
        },
    },
    { timestamps: true }
);

// IMPORTANT: for location-based queries
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ isOnline: 1 });
driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ userId: 1 });

module.exports = mongoose.model('Driver', driverSchema);
