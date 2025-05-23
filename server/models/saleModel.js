const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    distributorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                productName: {
                    type: String,
                    required: true
                },
                sellingPrice: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                netProfit: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    totalAmountToPaid: {
        type: Number,
        required: true
    },
    totalAmountPaid: {
        type: Number,
        default: 0
    },
    isDebt: {
        type: Boolean,
        default: true
    },
    paymentLog: {
        type: [
            {
                paymentAmount: {
                    type: Number,
                    required: true
                },
                paymentDate: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    status: {
        type: String,
        default: 'inprogress',
        enum: ['inprogress', 'delivered']
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);