const List = require('../models/list.js')
const Task = require('../models/task.js')

exports.getAllLists = async (req, res) => {
    // current user
    try {
        var results = []
        for (var i = 0; i < req.user.lists.length; i++) {
            const foundList = await List.findById(req.user.lists[i])
            results.push(foundList)
        }
        res.status(200).send(results)
    } catch(err) {
        res.status(404).send({message: "Error"})
    }

}