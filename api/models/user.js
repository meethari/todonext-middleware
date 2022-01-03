const mongoose = require('mongoose')

var userSchema =  mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    lists: [mongoose.Schema.Types.ObjectId]
})
module.exports = mongoose.model('user', userSchema)