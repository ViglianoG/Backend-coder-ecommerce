import ProductModel from "./models/product.model.js"

export default class Product {
    constructor() {}
    get = async () => {
        return await ProductModel.find()
    }

    getPaginate = async (search, options) => {
        return await ProductModel.paginate(search, options)
    }

    create = async (data) => {
        return await ProductModel.create(data)
    }

    getOneById = async (id) => {
        return await ProductModel.findById(id).lean().exec()
    }

    update = async (id, data) => {
        return await ProductModel.updateOne({
            _id: id
        }, data)
    }

    delete = async (id) => {
        return await ProductModel.deleteOne({
            _id: id
        })
    }

}