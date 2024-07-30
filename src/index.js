const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/userRouter')
const itemRouter = require('./routers/itemRouter')

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.use(userRouter)
app.use(itemRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})