const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const Item = require('../models/item')

const router = express.Router()

router.post('/user', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.createToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/login', async (req, res) => {
    try {
        const user = await User.findByCreds(req.body.email, req.body.password)
        const token = await user.createToken()
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.status(200).send("You are now logged out")
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.status(200).send("You are now logged out")
    } catch (e) {
        res.status(500).send(e)
    }
})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password']
    const isAllowed = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isAllowed){
        return res.status(400).send('Invalid update')
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await Item.deleteMany({owner: req.user._id})
        await User.deleteOne(req.user)
        res.status(200).send({"Deleted user": req.user, "Message": "User successfully deleted"})
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router