const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	iamgeUrl: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, { timestamps: true })

//export model based on schema (thi will create a database of that model)
module.exports = mongoose.model('Post', postSchema);