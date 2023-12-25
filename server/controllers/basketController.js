const { Basket, BasketProduct, Product } = require('../models/models');
const ApiError = require('../error/apiError');

class BasketController {
    async addToBasket(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, size, color } = req.body;
            const basket = await Basket.findOne({ where: {userId} });
            if (!basket) {
                return next(ApiError.badRequest('Basket not found'));
            }

            const basketProduct = await BasketProduct.create({
                basketId: basket.id,
                productId,
                size, // Добавляем размер
                color, // Добавляем цвет
            });

            return res.status(200).json(basketProduct);
        } catch (e) {
            return next(ApiError.internal('Internal server error'));
        }
    }

    async getBasket(req, res, next) {
        try {
            const userId = req.user.id; 
            const basket = await Basket.findOne({ 
                where: { userId },
                include: [{
                    model: BasketProduct,
                    include: [Product]
                }]
            });
            if (!basket) {
                return next(ApiError.badRequest('Basket not found'));
            }
            return res.status(200).json(basket);
        } catch (e) {
            next(ApiError.internal('Internal server error'));
        }
    }

    async removeProduct(req, res, next) {
        try {
            const { id } = req.params; // This assumes you're passing BasketProduct ID to remove
            const basketProduct = await BasketProduct.findOne({ where: { id }});
            if (!basketProduct) {
                return next(ApiError.badRequest('Product in basket not found'));
            }
            await basketProduct.destroy();
            return res.status(200).json({ message: 'Product removed from basket' });
        } catch (e) {
            next(ApiError.internal('Internal server error'));
        }
    }
}

module.exports = new BasketController();
