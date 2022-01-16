const List = require('../models/list.js')
const Task = require('../models/task.js')
const User = require('../models/user.js')

exports.createList = (listName, tasks, targetUser) => {
    
    return new Promise(async (resolve, reject) => {

        try {
            const newList = new List({listName, tasks})
            await newList.save()

            // add list to user
            targetUser.lists.push([newList._id])
            targetUser.save()
            
            // return list reference
            resolve(newList)
        } catch(err) {
            // TODO: test this
            // TODO2: prettify all the code 
            const customErr = Error()
            customErr.message = 'creating list failed'
            customErr.status = 500
            reject(customErr)
            return
        }
        
    })

    
    
}

exports.createTask = (text, done, targetList) => {

    return new Promise(async (resolve, reject) => {

        let newTask;
        // create task
        try {
            newTask = new Task({text, done})
            await newTask.save()
        } catch (_) {
            const e = new Error()
            e.message = "task could not be created"
            e.status = 500
            reject(e)
            return
        }

        // add to list
        try {
            targetList.tasks.push(newTask._id)
            await targetList.save()
        } catch (err) {
            console.log(err)
            const e = new Error()
            e.message = "couldn't save task to list"
            e.status = 404
            reject(e)
            return
        }
        
        resolve(newTask)
    })


}