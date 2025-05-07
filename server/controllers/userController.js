const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.createUser = async (req, res) => {
    try {
        const { phone, password, role } = req.body
        const existUser = await User.findOne({ phone })
        if (existUser) {
            return res.json({ message: "Telefon raqam bilan foydalanuvchi ro'yhatdan o'tgan" })
        }
        if (role !== "client") {
            if (!password) {
                return res.json({ message: "Parolni kiriting" })
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            req.body.password = hashedPassword
        }
        if (role !== 'admin') {
            req.body.adminId = req.user.adminId
        }
        await User.create(req.body)
        return res.status(200).json({ message: "Foydalanuvchi yaratildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body
        const user = await User.findOne({ phone })
        if (!user) {
            return res.json({ message: 'Telefon raqami xato' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ message: 'Parol xato' })
        }
        const payload = {
            adminId: user.role === "admin" ? user._id : user.adminId,
            userId: user._id
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        return res.json({ adminId: user.role === "admin" ? user._id : user.adminId, userId: user._id, fullname: user.fullname, role: user.role, token })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.getUsers = async (req, res) => {
    try {
        const { adminId } = req.user
        const users = await User.find({ adminId })
        res.json(users)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.updateUserLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Joylashuv ma'lumotlari yetarli emas" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    user.location = {
      lat,
      lng,
      addedAt: new Date(),
    };

    await user.save();

    return res
      .status(200)
      .json({ message: "Joylashuv saqlandi", location: user.location });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};
