const Upload = require('../../services/upload.service')
const mediaModel = require('../../models/media.model')
const date = require('../../services/dateAndTime.service')
const articleModel = require('../../models/article.model')
const categoryModel = require('../../models/category.model')
const fileSystemService = require('../../services/filesystem.service')
const messages = require('../../services/messages.service')

module.exports.showArticleForm = async (req, res) => {
    let data = {}
    data.categories = await categoryModel.all()
    res.render('admin/dashboard', {layout: 'addArticle', data})
}
module.exports.saveArticle = async (req, res) => {
    new Upload('articles', 'cover').uploadImages()(req, res, async (err) => {
        if (err) {
            res.status(400).send({message: err.message})
        } else {
            try {
                await isImagesReceived(req.file)
                await storingFilesAndArticle(req.file, req.body, res)
            } catch (e) {
                res.status(400).send({message: messages.unselectedImage})
            }
        }
    })
}
module.exports.editArticle = async (req, res) => {
    new Upload('articles', 'cover').uploadImages()(req, res, async (err) => {
        if (err) {
            res.status(400).send({message: err.message})
        } else {
            try {
                await updateArticle(req.body, req.file, res)
            } catch (e) {
                res.status(400).send({message: e.message})
            }
        }
    })
}
module.exports.showSingleArticle = async (req, res) => {
    try {
        const article = await articleModel.findById(req.query.id)
        article.createdAt = date.toJalaliDate(article.createdAt)
        res.render('admin/dashboard', {layout: 'singleArticle', data: article})
    } catch (e) {
        console.log(e)
        res.status(404).send({page: 'page Not Found'})
    }
}
module.exports.showEditArticleForm = async (req, res) => {
    const article = await articleModel.findById(req.params.id)
    const categories = await categoryModel.all()
    res.render('admin/dashboard', {layout: 'editArticle', data: {article, categories}})
}

async function storingFilesAndArticle(coverInfo, article, res) {
    try {
        await saveArticle(await saveImagesInfo(coverInfo), article)
        res.status(200).send({message: messages.successSaveArticle})
    } catch (e) {
        res.status(400).send({message: e.message})
    }
}

async function saveImagesInfo(coverInfo) {
    const media = await mediaModel.create(coverInfo)
    return media._id
}

async function saveArticle(coverId, article) {
    article.coverId = coverId
    return await articleModel.create(article)
}

async function updateArticle(article, file, res) {
    try {
        const oldArticle = await articleModel.findOneAndUpdate(article)
        if (file) {
            file.id = oldArticle.coverId
            await updateArticleCoverInfo(file)
        }
        res.status(200).send({message: messages.successEditArticle})
    } catch (e) {
        res.status(400).send({message: e})
    }
}

async function updateArticleCoverInfo(file) {
    try {
        const oldFile = await mediaModel.findOneAndUpdate(file)
        return fileSystemService.removeFile('uploads', oldFile.path)
    } catch (e) {
        throw e
    }
}

function isImagesReceived(file) {
    return new Promise((resolve, reject) => {
        if (file === undefined || file === '') {
            reject(messages.unselectedImage)
        }
        resolve()
    })
}