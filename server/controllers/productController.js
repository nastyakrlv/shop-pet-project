const uuid = require('uuid')
const path = require('path')
const fs = require('fs');
const {Product, ProductInfo} = require('../models/models')
const ApiError = require('../error/apiError')

class ProductController {
    async create(req, res, next) {
        try {
            const {name, price, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const product = await Product.create({name, price, img: fileName})
            
            if (info) {
                let infoData = JSON.parse(info) 
                infoData.forEach(i => {
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    })
                });
            }

            return res.json(product)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        } 
    }

    async getAll(req, res) {
        let {limit, page} = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = (page - 1) * limit; // Вычисляем offset
        let products = await Product.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset) }); // Передаем limit и offset как части options объекта
        return res.json(products);
    }

    async getOne(req, res) {
        const {id} = req.params
        const product = await Product.findOne(
            {
                where: {id},
                include: [{model: ProductInfo, as: 'info'}]
            },
        )
        return res.json(product)
    }

    async delete(req, res, next) {
        try {
            const {id} = req.params;
            const product = await Product.findOne({where: {id}});

            if (!product) {
                return next(ApiError.badRequest('Продукт не найден'));
            }

            // Удаление изображения из статической папки
            const imagePath = path.resolve(__dirname, '..', 'static', product.img);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            // Удаление информации о продукте
            await ProductInfo.destroy({ where: { productId: id } });

            // Удаление продукта
            await Product.destroy({ where: { id } });

            return res.json({ message: 'Продукт успешно удален' });
        } catch (e) {
            next(ApiError.internal('Внутренняя ошибка сервера'));
        }
    }
}

module.exports = new ProductController()