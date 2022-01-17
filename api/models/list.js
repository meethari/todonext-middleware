const mongoose = require("mongoose");

const listSchema = mongoose.Schema({
	listName: {
		type: String,
		required: true,
	},
	tasks: [mongoose.Schema.Types.ObjectId],
});

module.exports = mongoose.model("list", listSchema);
