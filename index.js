const express = require('express')
const route = require('./routes/routes')
const cors = require('cors')

const { connectToMongoDB } = require('./connection')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use('/api', route)

connectToMongoDB('mongodb://127.0.0.1:27017/invoice_api')
    .then(() => console.log('MongoDb connected'))

app.listen(5000, () => {console.log("Port connected")})