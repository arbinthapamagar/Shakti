import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    // ─── Who subscribed ───────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Subscription Type ────────────────────────────
    plan: {
      type: String,
      enum: ['parent', 'business'],
      required: true,
    },

    // ─── Child info (parent plan only) ────────────────
    childName:  { type: String, default: null },
    childPhoto: { type: String, default: null },
    childAge:   { type: Number, default: null },
    schoolName: { type: String, default: null },

    // ─── Business info (business plan only) ───────────
    businessName:    { type: String, default: null },
    businessAddress: { type: String, default: null },
    goodsType:       { type: String, default: null }, // what they deliver

    // ─── Route ────────────────────────────────────────
    pickup: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    dropoff: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    pickupTime:  { type: String, default: null }, // "07:00"
    dropoffTime: { type: String, default: null }, // "13:00"

    // ─── Assigned Drivers ─────────────────────────────
    primaryDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    backupDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
      },
    ],

    // ─── Pricing ──────────────────────────────────────
    monthlyPrice: { type: Number, required: true },
    missedDays:   { type: [Date], default: [] }, // for billing deduction

    // ─── Status ───────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    // ─── Vehicle type for this subscription ───────────
    vehicleType: {
      type: String,
      enum: ['tuktuk', 'tuktuk_delivery', 'scooter'],
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ primaryDriver: 1 });
subscriptionSchema.index({ 'pickup.location': '2dsphere' });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);