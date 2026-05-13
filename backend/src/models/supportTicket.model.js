import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    // ─── Who raised it ────────────────────────────────
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

    // ─── Ticket Details ───────────────────────────────
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'trip_issue',
        'payment_issue',
        'driver_complaint',
        'rider_complaint',
        'document_issue',
        'subscription_issue',
        'account_issue',
        'other',
      ],
      required: true,
    },

    // ─── Messages (conversation thread) ──────────────
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        senderType: {
          type: String,
          enum: ['user', 'driver', 'admin'],
          required: true,
        },
        message:   { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ─── Reference ────────────────────────────────────
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    // ─── Status ───────────────────────────────────────
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },

    // ─── Assigned moderator ───────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────
supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ driverId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);