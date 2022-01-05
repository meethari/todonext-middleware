# ToDoNext - Middleware

This is an express API that the ToDoNext frontend connects to.

## Acknowledgements
I used Anurag Majumdar's [E-commerce API project](https://github.com/anurag-majumdar/ecommerce-rest-api/) as reference. The organization of the api folder and some of the middleware functions were inspired by it.

## Set up
1. Clone the repo
2. Create a .env file with the following fields:
    MONGO_URI - URL to MongoDB instance containing DB username, password, and DB name

    JWT_STRING - Randomly generated string
    
    PORT - optional, TCP port for the server to listen to
3. Install using `npm i`
4. Run using `npm run start`

## API Guide

### User handlers
* POST /api/users/login - provide username and password fields
* POST /api/users/logout - logs user out
* POST /api/users/register - provide username and password fields to create an account

### Lists handlers
/api/lists endpoint

* GET - get all lists available to current user
* POST - create new list - requires listName field, tasks optional

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
