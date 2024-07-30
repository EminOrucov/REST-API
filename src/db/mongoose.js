const mongoose = require('mongoose')

const uri = process.env.dbURL

mongoose.connect(uri).then(() => {
    console.log("Connected to Database")
}).catch((e) => {
    console.log(e);
})