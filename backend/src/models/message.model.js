import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
      subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,        
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderType: {
      type: String,
      enum: ['rider', 'driver'],
      required: true,
    },

    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },

    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

messageSchema.index({ tripId: 1 });
messageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const Message = mongoose.model('Message', messageSchema);