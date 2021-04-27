const Upload = require('../services/upload')
const messages = require('../services/messages')
const mediaModel = require('../models/media')
const articleModel = require('../models/article')
module.exports.dashboard = (req, res) => {
    res.render('admin/dashboard', {layout: 'index'})
}
module.exports.blog = (req, res) => {
    res.render('admin/dashboard', {layout: 'blog'})
}
module.exports.comments = (req, res) => {
    res.render('admin/dashboard', {layout: 'comments'})
}
module.exports.addArticle = (req, res) => {
    res.render('admin/dashboard', {layout: 'addArticle'})
}
module.exports.saveArticle = async (req, res) => {
    new Upload('articles', 'files').uploadImages()(req, res, async (err) => {
        if (err) {
            res.status(400).send({message: err.message})
        } else {
            try {
                await isImagesSent(req.files)
                await storingFilesAndArticle(req.files, req.body, res)
            } catch (e) {
                res.status(400).send({message: messages.unselectedImage})
            }
        }
    })
}

async function storingFilesAndArticle(imagesInfo, article, res) {
    try {
        await saveArticle(await saveImagesInfo(imagesInfo), article)
        res.status(200).send({message: messages.successSaveArticle})
    } catch (e) {
        res.status(400).send({message: e.message})
    }
}

async function saveImagesInfo(imagesInfo) {
    const imagesIdAndUrl = []
    for (const info of imagesInfo) {
        const media = await mediaModel.create(info)
        imagesIdAndUrl.push({id: media._id.toString(), path: info.path})
    }
    return imagesIdAndUrl
}

async function saveArticle(imagesIdAndUrl, article) {
    article.images = await imagesIdAndUrl
    return await articleModel.create(article)
}

function isImagesSent(files) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            reject(messages.unselectedImage)
        }
        resolve()
    })
}