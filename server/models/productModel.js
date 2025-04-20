const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductType",
        required: true
    },
    totalPieceQuantity: {
        type: Number,
        required: true
    },
    unitPurchasePrice: {
        type: Number,
        required: true
    },
    unitSellingPrice: {
        type: Number,
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model('Product', ProductSchema);