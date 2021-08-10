// Requires
const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const path = require('path');
const passport = require('passport')
const connect_ensure_login = require('connect-ensure-login')
const Strategy = require('passport-local').Strategy;
const cors = require('cors')

// Mongoose

const setUpMongoose = () => {

    

    

    return {Task, User, List}
}

var {Task, User, List} = setUpMongoose()

// Passport

passport.use(new Strategy(
    function(username, password, done) {
        User.findOne({username: username}, function(err, user){
            if (err) {return(done(err))}
            if (!user) {return(done(null, false))}
            if (user.password != password) {return done(null, false)}
            return done(null, user)
        })
    }
))

// Serialize and deserialize
passport.serializeUser(function(user, done) {
    done(null, user._id)
})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (err) {return done(err)}
        done(null, user)
    })
})

// Express App

const app = express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// user handlers

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send({"message": "logged in"})
})

app.post('/logout', (req, res) => {
    req.logout()
    res.send({"message": "logged out"})
})

app.post('/register', async function (req, res) {

    // If both fields not provided, reject
    if (!(req.body.username && req.body.password)) {
        res.status(404).send('Format: {username, password}')
        return
    }

    // Check if user already exists
    userExists = await User.findOne({'username': req.body.username})

    if (userExists) {
        res.status(409).send('Account already exists. Try logging in.')
        return
    }

    // Create user
    var newUser = new User({username: req.body.username, password: req.body.password, lists: []})
    await newUser.save()

    // log in user and redirect them
    req.login(newUser, (err) => {
        if (err) {
            return res.status(500).send('Error in logging in user')
        }
        return res.status(200).send('Registered and logged in!')

    })

    // TODO 2: when you do this, provide the UI a message

} )

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

// get all lists
app.get('/api/lists/', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
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

})

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

// create list
app.post('/api/lists/', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
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
        res.status(404).send({message: "error"})
    }
})

// modify listName of list
app.patch('/api/lists/:id', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
    // the tasks list provided replaces the current list
    var foundList = await List.findById(req.params.id)

    if (foundList == null) {
        res.status(404).send({message : "Couldn't find that list"})
    }

    foundList.listName = req.body.listName
    try {
        foundList.save()
        res.send(foundList)
    } catch(err) {
        console.log(err)
        res.status(404).send({message : "Error in updating listName"})
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

// post handler - move task from :listId to :newListId
app.post('/api/lists/:listId/tasks/:taskId/move', connect_ensure_login.ensureLoggedIn(), async (req, res) => {
    try {
        var foundList = await List.findById(req.params.listId)
        var foundTask = await Task.findById(req.params.taskId)
        var newList = await List.findById(req.params.newListId)

        // add task to new list
        newList.tasks.push(foundTask._id)
        newList.save()

        // remove task from old list
        foundList.tasks.splice(foundList.tasks.indexOf(foundTask._id), 1)
        foundList.save()
        res.send(newList)
    }
    catch(err) {
        res.status(404).send({"message" : "task could not be moved"})
        console.log(err)
    }
})

app.get('/api', (req, res) => {
    res.send({"message": "This is the ToDoNext Middleware."})
})

