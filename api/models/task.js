const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    done: {
        type: Boolean,
        default: false
    } 
})
module.exports = mongoose.model('task', taskSchema)