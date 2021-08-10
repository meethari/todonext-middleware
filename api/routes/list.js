const express = require('express')
const router = express.Router()
const ListController = require('../controllers/list')
const { checkLoggedIn } = require('../middleware/auth')

router.use(checkLoggedIn)

router.get('/', ListController.getAllLists)

module.exports = router