const express = require("express");
const router = express.Router();
const ListController = require("../controllers/list");
const { checkLoggedIn } = require("../middleware/auth");

router.use(checkLoggedIn);

router.get("/", ListController.getAllLists);
router.post("/", ListController.createList);
router.get("/:listId", ListController.getList);
router.delete("/:listId", ListController.deleteList);
router.patch("/:listId", ListController.modifyList);

router.post("/:listId/tasks", ListController.createTask);
router.get("/:listId/tasks/:taskId", ListController.getTask);
router.patch("/:listId/tasks/:taskId", ListController.modifyTask);
router.delete("/:listId/tasks/:taskId", ListController.deleteTask);

module.exports = router;
