const articleSchema = require('../databases/schema/article')
const articleValidator = require('../validation/article')

class Article {
    async create(article) {
        try {
            await articleValidator.validateAsync(article)
            return await articleSchema.create(article)
        } catch (e) {
            throw e
        }
    }

    async updateById(id, article) {
        try {
            await articleValidator.validateAsync(article)
            return await articleSchema.findByIdAndUpdate(id, article)
        } catch (e) {
            throw e
        }
    }

    async deleteById(id) {
        try {
            return await articleSchema.deleteOne(id)
        } catch (e) {
            throw e
        }
    }

    async all() {
        try {
            return await articleSchema.find()
        } catch (e) {
            throw e
        }
    }

    async counts() {
        try {
            return await articleSchema.countDocuments()
        } catch (e) {
            throw e
        }
    }

    async paginateArticle(page, limit) {
        return await articleSchema.paginate({}, {page, limit, populate: "coverId"})
    }
}

module.exports = new Article()