const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        match: /^\+998\d{9}$/,
        unique: true
    },
    password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["admin", "manager", "distributor", 'client']
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
},{timestamps:true});

module.exports = mongoose.model('User', UserSchema);