const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Item = require('../models/item')
const auth = require('../middleware/auth')
const { route } = require('./itemRouter')

const picture = multer({
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Upload an image'))
        }
        cb(undefined, true)
    }
})

const router = express.Router()

router.post('/item', auth, async (req, res) => {
    const item = new Item({
        ...req.body,
        owner: req.user._id
    })
    try {
        await item.save()
        res.status(201).send("item created")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/item/:id/picture', auth, picture.single('itemPic'), async (req, res) => {
    const item = await Item.findById(req.params.id)
    const buffer = await sharp(req.file.buffer).png().resize({width: 400, height: 400}).toBuffer()

    item.image = buffer
    await item.save()

    res.send()
},(error, req, res, next) => {
    res.send({error: error.message})
})

router.get('/items', auth, async (req, res) => {
    const match = {}

    if(req.query.lessThanEqual){
        match.price = {$lte: parseInt(req.query.lessThanEqual)}
    }

    try {
        await req.user.populate({
            path: 'items',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        })
        res.status(200).send(req.user.items)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/items/:id', auth, async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.user._id})   
        if(!item){
            return res.status(404).send('Item not found')
        }
        res.status(200).send(item)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/item/:id/picture', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)

        if(!item || !item.image){
            throw new Error()
        }

        res.set('Content-Type', 'image/png').send(item.image)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/items/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'count', 'price', 'sale']
    const isAllowed = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isAllowed){
        return res.status(400).send('Invalid update')
    }

    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.user._id})
        
        if(!item){
            return res.status(404).send('Item not found')
        }

        updates.forEach(update => item[update] = req.body[update])
        await item.save()

        res.status(200).send(item)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/items/:id', auth, async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({_id: req.params.id, owner: req.user._id})   
        if(!item){
            return res.status(404).send('Item not found')
        }
        res.status(200).send(item)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/item/:id/picture', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
        item.image = undefined
        await item.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router