const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

exports.login = (req, res, next) => {
    /*
        Check if req.body has username and password
        If not, handle
        Find user in User collection with username
        If no such, handle
        Check if the password matches
        If it doesn't, handle
        Finally we can create a jwt of {id: user._id}, and send it to user as token
    */

    if ( !(req.body.username && req.body.password) ) {
        return errorHandler(null, "Body must contain username and password", next)
    }

    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return errorHandler(err, "", next)
        } else if (!user) {
            return errorHandler(null, "username does not exist", next)
        } else if (user.password !== req.body.password) {
            return errorHandler(null, "incorrect password", next)
        } else {
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.send({"message": "successfully logged in", "token" : token})
        }
    })


}

const errorHandler = (err, message, next) => {
    if (err) {
        err.message = 'Authentication failed'
        err.status = 401
        next(err)
    } else {
        err = new Error()
        err.message = message
        err.status = 401
        next(err)
    }
}

exports.register = () => {
    // Similar to register, except a JWT is returned
}
