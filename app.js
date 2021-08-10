const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { deserializeJWT } = require('./api/middleware/auth' )

// import routes
const userRoutes = require('./api/routes/user')
const listRoutes = require('./api/routes/list')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express()
// Logging
app.use(morgan('dev'))

// Body Parser for json
app.use(express.json())

// CORS
app.use(cors())

// Deserialize JWT tokens
app.use(deserializeJWT)

// Add Route routers
app.use('/api/users', userRoutes)
app.use('/api/lists', listRoutes)

// Handle 404s
app.use((req, res, next) => {
    const error = new Error()
    error.message = 'Not Found';
    error.status = 404
    next(error)
})

// Finally handle errors
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: error
    })
})

module.exports = app