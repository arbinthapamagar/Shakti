import mongoose from 'mongoose';

const driverAvailabilitySchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    unavailableReason: {
      type: String,
      enum: ['sick', 'personal', 'vehicle_issue', 'other'],
      default: null,
    },

    // driver must confirm every morning
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },

    assignedSubscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
      },
    ],

    backupAssigned: {
      type: Boolean,
      default: false,
    },
    backupDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
  },
  { timestamps: true }
);

// one record per driver per day only
driverAvailabilitySchema.index(
  { driverId: 1, date: 1 },
  { unique: true }
);

driverAvailabilitySchema.index({ date: 1 });
driverAvailabilitySchema.index({ isAvailable: 1 });
driverAvailabilitySchema.index({ isCheckedIn: 1 });

export const DriverAvailability = mongoose.model(
  'DriverAvailability',
  driverAvailabilitySchema
);