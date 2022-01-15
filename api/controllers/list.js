const List = require('../models/list.js')
const Task = require('../models/task.js')
const User = require('../models/user.js')
const {createList, createTask} = require('./functions.js')

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
        var newList = await createList(req.body.listName, req.body.tasks, req.user)

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

exports.getList = async (req, res) => {
    // get list object, with all tasks embedded

    try {
        var foundList = await List.findById(req.params.listId)
    } 
    catch(e) {
        res.status(404).send({"message": "Can't find list with that id"})
        return
    }

    try {
        var taskIds = foundList.tasks
        var taskPromiseList = []
        taskIds.forEach((taskId) => {
            taskPromiseList.push(Task.findById(taskId))
        })
        // console.log(taskPromiseList)
        const resolvedPromiseList = await Promise.all(taskPromiseList)
        var foundListWithTasks = {... foundList._doc}
        foundListWithTasks.tasks = resolvedPromiseList
        res.send(foundListWithTasks)
    }
    catch(e) {
        res.status(404).send({"message": "Couldn't find one of the tasks in the list"})
    }
}

exports.deleteList = async (req, res) => {
    try {
        // delete tasks associated with list
        var foundList = await List.findById(req.params.listId)
        var tasksToDelete = foundList.tasks
        await Promise.all(tasksToDelete.map(async (taskId) => {
            await Task.findByIdAndRemove(taskId)
        }))

        // delete the list from the user
        var foundUser = await User.findById(req.user._id)
        foundUser.lists.splice(foundUser.lists.indexOf(foundList._id), 1)
        await foundUser.save()

        // finally delete the user
        await foundList.remove()
        res.send({"message" : "list deleted"})
    } catch(err) {
        res.status(404).send({"message" : "list could not be deleted"})
        console.log(err)
    }
}

exports.createTask = async (req, res, next) => {

    try {
        const listRef = List.findById(req.params.listId)
    } catch(_) {
        const e = new Error('list could not be retrieved')
        e.status = 404
        throw e
    }

    try {
        console.log("Before await createTask")
        const newTask = await createTask(req.body.text, req.body.done,)
        res.send(newTask)
    } catch(e) {
        console.log(e)
        next(e)
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

exports.modifyTask = async (req, res) => {

    const task = await Task.findById(req.params.taskId)

    if (task == null) {
        res.status(404).send({message: "No matching document found"})
        return
    }

    const sentObject = req.body

    if (!('done' in sentObject || 'text' in sentObject)) {
        res.status(404).send({message: "Either done or text fields should be present"})
        return
    }

    if ('done' in sentObject) {
        task.done = sentObject.done
    }

    if (sentObject.text) {
        task.text = sentObject.text
    }

    try {
        task.save()
        res.send(task)
    } catch(err) {
        console.log(err)
        res.status(404).send({message: "Unable to modify task"})
    } 

}

exports.deleteTask = async (req, res) => {
    try {
        var foundList = await List.findById(req.params.listId)
        var foundTask = await Task.findById(req.params.taskId)
        foundTask.remove()
        foundList.tasks.splice(foundList.tasks.indexOf(foundTask._id), 1)
        await foundList.save()
        res.send(foundList)
    } catch(err) {
        res.status(404).send({"message" : "list could not be updated"})
        console.log(err)
    }
}