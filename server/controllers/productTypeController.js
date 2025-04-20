const ProductType = require('../models/productTypeModel');
const Product = require('../models/productModel');

exports.createProductType = async (req, res) => {
    try {
        const { adminId } = req.user
        req.body.adminId = adminId
        await ProductType.create(req.body)
        return res.json({ message: "Mahsulot turi qo'shildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getProductTypes = async (req, res) => {
    try {
        const { adminId } = req.user
        const productTypes = await ProductType.find({ adminId })
        return res.json(productTypes)


    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.updateProductType = async (req, res) => {
    try {
        const { productTypeId } = req.params
        await ProductType.findByIdAndUpdate(productTypeId, req.body)
        return res.json({ message: "Mahsulot turi tahrirlandi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.deleteProductType = async (req, res) => {
    try {
        const { productTypeId } = req.params
        await ProductType.findByIdAndDelete(productTypeId)
        await Product.findOneAndUpdate({ productTypeId }, { $set: { productTypeId: null } })
        return res.json({ message: "Mahsulot turi o'chirildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}