const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

const deserializeJwt = (req, _, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // if there's no authorization, that's okay
        req.user = null
        return next()
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return handleError(err, next)
        }

        User.findOne({_id: decoded.id}, (err, user) => {
            if (err) {
                return handleError(err, next)
            }
            req.user = user
            next()
        })
    })
}

const checkLoggedIn = (req, res, next) => {
    if (!req.user) {
        const err = new Error()
        err.message = 'You need to be logged in for this operation'
        err.status = 401
        return next(err)
    }
    next()
}

const handleError = (err, next) => {
    if (err) {
        err.message = "Authentication Failed."
        err.status = 401
        next(err)
    } else {
        err = new Error()
        err.message = "Authentication Failed."
        err.status = 401
        next(err)
    }
}

module.exports = {deserializeJwt, checkLoggedIn}