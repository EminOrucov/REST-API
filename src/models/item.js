const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sale: {
        type: Number,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    image: {
        type: Buffer
    }
},{
    timestamps: true
})

itemSchema.methods.toJSON = function(){
    const item = this
    const itemObj = item.toObject()

    delete itemObj.image

    return itemObj
}

const Item = mongoose.model('Item', itemSchema)

module.exports = Item