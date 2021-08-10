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
    } catch (err) {
        res.status(404).send({ message: "Error" })
    }

}

exports.createList = async (req, res) => {
    // we need listName
    try {
        var newList = new List(req.body)
        await newList.save()

        // add list to user
        req.user.lists.push([newList._id])
        req.user.save()

        res.status(201).send(newList)
    } catch (err) {
        console.log(err)
        res.status(404).send({ message: "error" })
    }
}

exports.modifyList = async (req, res) => {
    // the tasks list provided replaces the current list
    var foundList = await List.findById(req.params.listId)

    if (foundList == null) {
        res.status(404).send({ message: "Couldn't find that list" })
    }

    foundList.listName = req.body.listName
    try {
        foundList.save()
        res.send(foundList)
    } catch (err) {
        console.log(err)
        res.status(404).send({ message: "Error in updating listName" })
    }
}

exports.createTask = async (req, res) => {

    // create task
    try {
        var newTask = new Task(req.body)
        await newTask.save()
    } catch (err) {
        console.log(err)
        res.status(404).send({ "message": "task could not be created" })
        return
    }

    // add to list
    try {
        var foundList = await List.findById(req.params.listId)
        foundList.tasks.push(newTask._id)
        await foundList.save()
        res.send(newTask)
    } catch (err) {
        res.status(404).send({ "message": "list could not be updated" })
        console.log(err)
    }


}

exports.getTask = async (req, res) => {
    try {
        var foundTask = await Task.findById(req.params.taskId)
        res.send(foundTask)
    } catch(err) {
        res.status(404).send({"message" : "task could not be found"})
        console.log(err)
    }
}