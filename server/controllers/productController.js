const Product = require('../models/productModel');
const ProductType = require('../models/productTypeModel');

exports.createProduct = async (req, res) => {
    try {
        const { productTypeId, totalPieceQuantity } = req.body
        const { adminId } = req.user
        req.body.adminId = adminId
        const productType = await ProductType.findById(productTypeId)
        if (productType.packageType === 'box') {
            req.body.totalPieceQuantity = totalPieceQuantity * productType.pieceQuantityPerBox
        }
        await Product.create(req.body)
        return res.json({ message: "Mahsulot qo'shildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.getProducts = async (req, res) => {
    try {
        const { adminId } = req.user;
        const products = await Product.find({ adminId }).populate('productTypeId');
        return res.json(products);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(productId);
        const { adminId } = req.user;

        const product = await Product.findOne({ _id: productId, adminId });
        if (!product) {
            return res.status(404).json({ message: "Mahsulot topilmadi" });
        }

        const { productTypeId, totalPieceQuantity } = req.body;
        if (productTypeId && totalPieceQuantity) {
            const productType = await ProductType.findById(productTypeId);
            if (productType.packageType === 'box') {
                req.body.totalPieceQuantity = totalPieceQuantity * productType.pieceQuantityPerBox;
            }
        }

        await Product.findByIdAndUpdate(productId, req.body);
        return res.json({ message: "Mahsulot yangilandi" });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { adminId } = req.user;

        const product = await Product.findOne({ _id: productId, adminId });
        if (!product) {
            return res.status(404).json({ message: "Mahsulot topilmadi yoki ruxsat yo'q" });
        }

        await Product.findByIdAndDelete(productId);
        return res.json({ message: "Mahsulot o'chirildi" });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};
