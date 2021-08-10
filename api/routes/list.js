const express = require('express')
const router = express.Router()
const ListController = require('../controllers/list')
const { checkLoggedIn } = require('../middleware/auth')

router.use(checkLoggedIn)

router.get('/', ListController.getAllLists)
router.post('/', ListController.createList)
router.patch('/:listId', ListController.modifyList)
router.post('/:listId/tasks', ListController.createTask)
router.get('/:listId/tasks/:taskId', ListController.getTask)

module.exports = router