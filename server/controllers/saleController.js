const Product = require('../models/productModel');
const Sale = require('../models/saleModel');

exports.createSale = async (req, res) => {
    try {
        const { products, clientId, distributorId } = req.body;
        const { adminId } = req.user;

        let totalAmountToPaid = 0;
        const updatedProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.productId).populate('productTypeId');
            if (!product) {
                return res.status(404).json({ message: `Mahsulot topilmadi: ${item.productId}` });
            }

            const netProfit = (item.sellingPrice - product.unitPurchasePrice) * item.quantity;
            totalAmountToPaid += item.sellingPrice * item.quantity;

            product.totalPieceQuantity -= item.quantity;
            await product.save();

            updatedProducts.push({
                productId: item.productId,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity,
                netProfit: netProfit,
                productName: product.productTypeId.name,
            });
        }

        const newSale = await Sale.create({
            clientId,
            distributorId,
            adminId,
            products: updatedProducts,
            totalAmountToPaid
        });

        const populatedSale = await Sale.findById(newSale._id)
            .populate('clientId', 'fullname phone')
            .populate('distributorId', 'fullname phone')
            .populate('products.productId')
            .populate({
                path: 'products.productId',
                populate: {
                    path: 'productTypeId',
                    select: 'name packageType pieceQuantityPerBox',
                }
            });

        return res.status(201).json({
            message: "Sotuv muvaffaqiyatli yaratildi",
            record: populatedSale
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};


exports.getSales = async (req, res) => {
    try {
        const { adminId } = req.user;
        const sales = await Sale.find({ adminId })
            .populate('clientId', 'fullname phone')
            .populate('distributorId', 'fullname phone')
            .populate('products.productId')
            .populate({
                path: 'products.productId',
                populate: {
                    path: 'productTypeId',
                    select: 'name packageType pieceQuantityPerBox',
                }
            });

        return res.json(sales);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};


exports.createPayment = async (req, res) => {
    try {
        const { saleId } = req.params;
        const { paymentAmount } = req.body;

        const sale = await Sale.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: "Sotuv topilmadi" });
        }

        sale.paymentLog.push({
            paymentAmount
        });

        sale.totalAmountPaid += paymentAmount;

        if (sale.totalAmountPaid >= sale.totalAmountToPaid) {
            sale.isDebt = false;
        }

        await sale.save();

        return res.status(200).json({ message: "To'lov muvaffaqiyatli qo'shildi" });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};

exports.deliverSale = async (req, res) => {
    try {
        const { saleId } = req.params
        const { paymentAmount } = req.body;
        const sale = await Sale.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: "Sotuv topilmadi" });
        }

        sale.paymentLog.push({
            paymentAmount
        });

        sale.totalAmountPaid += paymentAmount;
        sale.status = 'delivered'

        if (sale.totalAmountPaid >= sale.totalAmountToPaid) {
            sale.isDebt = false;
        }

        await sale.save();
        return res.status(200).json({ message: "Mahsulot muvaffaqiyatli yetkazib berildi" });


    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}