# ToDoNext - Middleware

This is an express API that the ToDoNext frontend connects to.

## API Guide

### User handlers
POST /login - provide username and password fields
POST /logout - logs user out
POST /register - provide username and password fields to create an account

### Lists handlers
/api/lists endpoint
GET - get all lists available to current user
POST - create new list - requires listName field, tasks optional

/api/lists/:listID endpoint
+ GET - get list, with all tasks embedded
+ PATCH - to modify list (usually just rename) - requires listName field
+ DELETE - delete existing list 

### Tasks handlers
/api/lists/:listID/tasks/ endpoint
+ POST - create new task - requires text field, done optional

/api/lists/:listID/tasks/:taskID endpoint
+ GET - get task  
+ PATCH - update task - require either text or done field
+ DELETE - delete task 