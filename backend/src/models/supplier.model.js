import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
    {
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        contactPerson: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            enum: ['kathmandu', 'pokhara', 'lalitpur', 'bhaktapur', 'birgunj', 'butwal', 'other'],
            required: true,
        },
        logoUrl: {
            type: String,
            default: null,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },

        plan: {
            type: String,
            enum: ['basic', 'premium'],
            default: 'basic',
        },
        planExpiresAt: {
            type: Date,
            default: null,
        },

        vehicles: [
            {
                type: {
                    type: String,
                    enum: ['tuktuk', 'scooter'],
                    required: true,
                },
                brand: {
                    type: String,
                },
                model: {
                    type: String,
                },
                priceType: {
                    type: String,
                    enum: ['sale', 'rent', 'installment'],
                },
                price: {
                    type: Number,
                },
                images: {
                    type: [String],
                    default: [],
                },
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                specs: {
                    type: String,
                    default: null,
                }, // range, battery etc
            },
        ],

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

supplierSchema.index({ city: 1 });
supplierSchema.index({ isVerified: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ plan: 1 });

export const Supplier = mongoose.model('Supplier', supplierSchema);
