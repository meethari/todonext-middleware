const List = require('../models/list.js')
const Task = require('../models/task.js')
const User = require('../models/user.js')

exports.createList = (listName, tasks, targetUser) => {
    
    return new Promise(async (resolve, _) => {
        const newList = new List({listName, tasks})
        await newList.save()

        // add list to user
        targetUser.lists.push([newList._id])
        targetUser.save()
        
        // return list reference
        resolve(newList)
    })

    
    
}

exports.createTask = (text, done=false) => {}