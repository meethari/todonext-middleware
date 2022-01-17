const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");
const List = require("../models/list");
const Task = require("../models/task");
const { createList, createTask } = require("../functions.js");

exports.login = async (req, res, next) => {
	/*
        Check if req.body has username and password
        If not, handle
        Find user in User collection with username
        If no such, handle
        Check if the password matches
        If it doesn't, handle
        Finally we can create a jwt of {id: user._id}, and send it to user as token
    */

	if (!(req.body.username && req.body.password)) {
		return errorHandler(null, "Body must contain username and password", next);
	}

	User.findOne({ username: req.body.username }, async (err, user) => {
		if (err) {
			return errorHandler(err, "", next);
		} else if (!user) {
			return errorHandler(null, "username does not exist", next);
		} else {
			const isPasswordCorrect = await bcrypt.compare(
				req.body.password,
				user.passwordHash
			);

			if (!isPasswordCorrect) {
				return errorHandler(null, "incorrect password", next);
			}

			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
			res.send({ message: "successfully logged in", token: token });
		}
	});
};

const errorHandler = (err, message, next) => {
	if (err) {
		err.message = "Authentication failed";
		err.status = 401;
		next(err);
	} else {
		err = new Error();
		err.message = message;
		err.status = 401;
		next(err);
	}
};

exports.register = async (req, res) => {
	// If both fields not provided, reject
	if (!(req.body.username && req.body.password)) {
		res.status(404).send("Format: {username, password}");
		return;
	}

	// Check if user already exists
	userExists = await User.findOne({ username: req.body.username });

	if (userExists) {
		res.status(409).send("Account already exists. Try logging in.");
		return;
	}

	// Create user
	const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

	const task1 = new Task({
		text: "1. Mark this task as done by checking the checkbox next to it!",
		done: false,
	});
	const task2 = new Task({
		text: "2. Add a task to this list using the 'Add Task' button!",
		done: false,
	});
	const task3 = new Task({
		text: "3. Create another list using the 'New List' button!",
		done: false,
	});
	const task4 = new Task({
		text: "You've got the hang of this! Delete this list and start using ToDoNext!",
		done: false,
	});

	await Promise.all([task1.save(), task2.save(), task3.save(), task4.save()]);

	const onboardingList = new List({
		listName: "Introduction to ToDoNext",
		tasks: [task1._id, task2._id, task3._id, task4._id],
	});

	await onboardingList.save();

	var newUser = new User({
		username: req.body.username,
		passwordHash,
		lists: [onboardingList._id],
	});
	await newUser.save();

	// log in user and redirect them
	const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
	res.send({ message: "successfully registered.", token: token });
};
