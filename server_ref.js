

// tasks handlers

// create task
app.post('/api/lists/:listId/tasks', connect_ensure_login.ensureLoggedIn(), async (req, res) => {

    // create task
    try {
        var newTask = new Task(req.body)
        await newTask.save()
    } catch (err) {
        console.log(err)
        res.status(404).send({"message" : "task could not be created"})
        return
    }

    // add to list
    try {
        var foundList = await List.findById(req.params.listId)
        foundList.tasks.push(newTask._id)
        await foundList.save()
        res.send(newTask)
    } catch(err) {
        res.status(404).send({"message" : "list could not be updated"})
        console.log(err)
    }
    

})

// delete task in a list
app.delete('/api/lists/:listId/tasks/:taskId', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
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
})

// get task that belongs to a list
app.get('/api/lists/:listId/tasks/:taskId', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
    try {
        var foundTask = await Task.findById(req.params.taskId)
        res.send(foundTask)
    } catch(err) {
        res.status(404).send({"message" : "task could not be found"})
        console.log(err)
    }
})

// patch handler for tasks in a list
app.patch('/api/lists/:listId/tasks/:id', connect_ensure_login.ensureLoggedIn(), async (req, res) => {

    const task = await Task.findById(req.params.id)

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

})

// lists handler


// get specific list
app.get('/api/lists/:listId', connect_ensure_login.ensureLoggedIn() , async (req, res) => {
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
})

// delete list
app.delete('/api/lists/:listId', connect_ensure_login.ensureLoggedIn() , async (req, res) => {
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
})


app.get('/api', (req, res) => {
    res.send({"message": "This is the ToDoNext Middleware."})
})

