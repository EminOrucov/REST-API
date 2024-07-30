const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('items', {
    ref: "Item",
    localField: "_id",
    foreignField: "owner"
})

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.statics.findByCreds = async(email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw new Error('Unable to login')
    }
    return user
}

userSchema.methods.createToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, process.env.secretKey)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()
    
    delete userObj.password
    delete userObj.tokens

    return userObj
}

const User = mongoose.model('User', userSchema)

module.exports = User
