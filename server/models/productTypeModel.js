const mongoose = require('mongoose');

const ProductTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    packageType: {
        type: String,
        required: true,
        enum: ['piece', 'box']
    },
    pieceQuantityPerBox: {
        type: Number,
        default: 1
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ProductType', ProductTypeSchema);